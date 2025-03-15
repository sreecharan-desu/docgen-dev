import { projectAtom } from "@/store/store"
import { useRecoilState } from "recoil"
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle, Pencil, Trash } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ProjectPage() {
    const projectdetails = useRecoilState(projectAtom)
    const BASE_URL = "https://api2.docgen.dev/api/v1";
    const JWT_TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMGVlYmM5OS05YzBiLTRlZjgtYmI2ZC02YmI5YmQzODBhMTEiLCJleHAiOjE3NDIwNjI0ODJ9.JJanslj1_axBmcRqx4VvdzyU-jKjXVpDhiUWn0LmdII"

    // Get Project List
    const getProjects = async (ownerId) => {
        const response = await fetch(
            `${BASE_URL}/project/list-project?owner_id=${ownerId}`,
            {
                headers: { Authorization: JWT_TOKEN },
            }
        );

        if (!response.ok) throw new Error("Failed to fetch projects");
        return response.json();
    };

    // Rename Project
    const renameProject = async (projectId, newName) => {
        const response = await fetch(
            `${BASE_URL}/project/rename-project?project_id=${projectId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: JWT_TOKEN,
                },
                body: JSON.stringify({ name: newName }),
            }
        );

        if (!response.ok) throw new Error("Failed to rename project");
        return response.json();
    };

    // Delete Project
    const deleteProject = async (projectId) => {
        const response = await fetch(
            `${BASE_URL}/project/delete-project?project_id=${projectId}`,
            {
                method: "DELETE",
                headers: { Authorization: JWT_TOKEN },
            }
        );

        if (!response.ok) throw new Error("Failed to delete project");
        return response.json();
    };

    const { id } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const projects = await getProjects("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11");
                const currentProject = projects.find((p) => p.id === id);
                if (!currentProject) throw new Error("Project not found");
                setProject(currentProject);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [id]);

    const handleRename = async () => {
        if (!newName.trim()) return setError("Project name cannot be empty");
        try {
            const response = await renameProject(id, newName);
            setProject((prev) => ({ ...prev, name: response.new_name }));
            setIsEditing(false);
            setNewName("");
        } catch (err) {
            setError("Failed to rename project");
        }
    };

    const handleDelete = async () => {
        try {
            await deleteProject(id);
            navigate("/"); // Redirect back to homepage after deletion
        } catch (err) {
            setError("Failed to delete project");
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error)
        return (
            <div className="text-red-500 flex items-center gap-2">
                <AlertCircle className="h-6 w-6" />
                {error}
            </div>
        );

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <Card className="p-6 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">
                        {isEditing ? (
                            <Input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="text-lg"
                                placeholder="Enter new project name"
                            />
                        ) : (
                            project.name
                        )}
                    </h1>

                    {isEditing ? (
                        <Button onClick={handleRename} className="ml-2">
                            Save
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEditing(true);
                                setNewName(project.name);
                            }}
                        >
                            <Pencil className="h-4 w-4 mr-2" />
                            Rename
                        </Button>
                    )}
                </div>

                <p className="text-gray-600 mb-4">{project.description}</p>

                <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                        Repositories: {project.repo_count}
                    </span>

                    <Button variant="destructive" onClick={handleDelete}>
                        <Trash className="h-4 w-4 mr-2" />
                        Delete Project
                    </Button>
                </div>
            </Card>

            {error && (
                <div className="text-red-500 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </div>
            )}
        </div>
    );
};

// Loading Spinner
const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
    </div>
);
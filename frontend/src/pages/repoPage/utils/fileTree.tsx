export const buildFileTree = (files) => {
    const tree = { name: "root", children: [], isFolder: true };
    files.forEach((file) => {
      const parts = file.split("/");
      let current = tree;
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          current.children.push({ name: part, isFolder: false });
        } else {
          let folder = current.children.find((child) => child.name === part && child.isFolder);
          if (!folder) {
            folder = { name: part, children: [], isFolder: true };
            current.children.push(folder);
          }
          current = folder;
        }
      });
    });
    return tree;
  };
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Terminal, FileCode, Info, Key, Command, Menu, X } from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
  items?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: "Introduction",
    href: "#introduction",
    icon: <Info className="h-4 w-4" />,
  },
  {
    title: "Installation",
    href: "#installation",
    icon: <Terminal className="h-4 w-4" />,
  },
  {
    title: "Authentication",
    href: "#authentication",
    icon: <Key className="h-4 w-4" />,
  },
  {
    title: "Commands",
    href: "#commands",
    icon: <Command className="h-4 w-4" />,
    items: [
      { title: "Generate", href: "#generate" },
      { title: "Update", href: "#update" },
      { title: "Clean", href: "#clean" },
      { title: "Config (Under Development)", href: "#config" },
      { title: "Usage", href: "#usage" },
    ],
  },
];

const DocsPage = () => {
  const [activeSection, setActiveSection] = useState("introduction");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-[64px] sm:pt-[72px] m-0">
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="md:hidden fixed top-[72px] right-4 z-50 p-2 rounded-md bg-[#111111] text-white hover:bg-[#1F1F1F]"
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Left Sidebar - adjusted for mobile */}
      <aside
        className={cn(
          "fixed left-0 top-[64px] sm:top-[72px] h-[calc(100vh-64px)] sm:h-[calc(100vh-72px)] w-64 bg-[#111111] border-r border-[#1F1F1F] overflow-y-auto transition-transform duration-300 z-40",
          "md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <FileCode className="h-6 w-6 text-emerald-500" />
            <span className="font-semibold text-white">DocGen</span>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <div key={item.href}>
                <a
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                    activeSection === item.href.replace("#", "")
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "text-gray-400 hover:text-white hover:bg-[#1F1F1F]"
                  )}
                  onClick={() => {
                    setActiveSection(item.href.replace("#", ""));
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {item.icon}
                  {item.title}
                </a>
                {item.items?.map((subItem) => (
                  <a
                    key={subItem.href}
                    href={subItem.href}
                    className={cn(
                      "flex items-center gap-2 pl-9 py-2 text-sm rounded-md transition-colors",
                      activeSection === subItem.href.replace("#", "")
                        ? "text-emerald-500"
                        : "text-gray-500 hover:text-gray-300"
                    )}
                    onClick={() => {
                      setActiveSection(subItem.href.replace("#", ""));
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {subItem.title}
                  </a>
                ))}
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 top-[64px] sm:top-[72px] bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content - adjusted for mobile */}
      <main className="w-full md:ml-64 min-h-screen bg-[#0A0A0A] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12">
          {/* Add scroll margin to all section headers and sub-headers */}
          <style global="true">{`
            section, 
            section > div[id],
            section div[id] {
              scroll-margin-top: 6rem;
            }
          `}</style>

          {/* Header Section with proper spacing */}
          <div className="mb-12 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">
              Documentation
            </h1>
            <p className="text-gray-400 text-base sm:text-lg">
              Learn how to use DocGen CLI to generate AI-powered documentation.
            </p>
          </div>

          {/* Installation */}
          <section id="installation" className="mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
              Installation
            </h2>
            <p className="text-gray-400 mb-4">
              Install DocGen using pip package manager:
            </p>
            <div className="bg-[#111111] rounded-lg p-3 sm:p-4 mb-4 group relative overflow-x-auto">
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 sm:right-3 top-2 sm:top-3 opacity-0 group-hover:opacity-100 transition bg-[#1F1F1F] hover:bg-[#2A2A2A] text-gray-400"
              >
                Copy
              </Button>
              <pre className="text-gray-300 font-mono text-sm sm:text-base overflow-x-auto">
                <code>$ pip install docgen-cli</code>
              </pre>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
              <Info className="h-4 w-4" />
              <span>Requires Python 3.7 or higher</span>
            </div>
          </section>

          {/* Authentication */}
          <section id="authentication" className="mb-12 sm:mb-16">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="p-2 rounded-md bg-emerald-500/10">
                <Key className="h-4 sm:h-5 w-4 sm:w-5 text-emerald-500" />
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold">
                Authentication
              </h2>
            </div>

            {/* Anonymous Usage */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                Anonymous Usage
              </h3>
              <p className="text-gray-400 mb-4">
                You can start using DocGen CLI immediately without
                authentication. Anonymous users get:
              </p>
              <div className="bg-[#111111] rounded-lg p-3 sm:p-4 mb-4">
                <div className="flex items-center gap-2 text-sm sm:text-base text-gray-300">
                  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  <span>20 free requests per month</span>
                </div>
                <div className="mt-2 text-xs sm:text-sm text-gray-500">
                  No API key required. Just install and start using:
                </div>
                <pre className="mt-3 text-gray-300 font-mono text-sm sm:text-base overflow-x-auto">
                  <code>$ docgen generate</code>
                </pre>
              </div>
            </div>

            {/* API Key Authentication */}
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                API Key Authentication
              </h3>
              <p className="text-gray-400 mb-4">
                Authenticate with an API key to get additional benefits:
              </p>
              <div className="bg-[#111111] rounded-lg p-3 sm:p-4 mb-6">
                <div className="flex items-center gap-2 text-sm sm:text-base text-gray-300 mb-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  <span>
                    30 additional free requests (total 50 requests per month)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm sm:text-base text-gray-300 mb-4">
                  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  <span>Access to premium features</span>
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mb-3">
                  Get your API key from the dashboard and authenticate:
                </div>
                <div className="bg-[#1F1F1F] rounded-lg p-3 sm:p-4 group relative overflow-x-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 sm:right-3 top-2 sm:top-3 opacity-0 group-hover:opacity-100 transition bg-[#2A2A2A] hover:bg-[#333333] text-gray-400"
                  >
                    Copy
                  </Button>
                  <pre className="text-gray-300 font-mono text-sm sm:text-base overflow-x-auto">
                    <code>$ docgen auth login --key=YOUR_API_KEY</code>
                  </pre>
                </div>
              </div>

              {/* Usage Tracking */}
              <div className="flex items-start gap-2 p-3 sm:p-4 rounded-lg bg-[#111111] border border-[#1F1F1F]">
                <Info className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm sm:text-base text-gray-300">
                    Track your usage
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Check your current usage and remaining requests:
                  </p>
                  <pre className="mt-2 text-gray-300 font-mono text-sm sm:text-base overflow-x-auto">
                    <code>$ docgen usage</code>
                  </pre>
                </div>
              </div>
            </div>
          </section>

          {/* Commands */}
          <section id="commands" className="mb-12 sm:mb-16">
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <div className="p-2 rounded-md bg-emerald-500/10">
                <Command className="h-4 sm:h-5 w-4 sm:w-5 text-emerald-500" />
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold">Commands</h2>
            </div>

            {/* Generate Command */}
            <div id="generate" className="mb-16">
              <h3 className="text-xl font-semibold mb-4">Generate (g)</h3>
              <p className="text-gray-400 mb-4">
                Generates documentation for a file or directory. You can use
                either <code className="text-emerald-500">docgen generate</code>{" "}
                or the shorter alias{" "}
                <code className="text-emerald-500">docgen g</code> to generate
                codebase documentation.
              </p>
              <div className="space-y-6">
                <div className="bg-[#111111] rounded-lg p-4 group relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition bg-[#1F1F1F] hover:bg-[#2A2A2A] text-gray-400"
                  >
                    Copy
                  </Button>
                  <pre className="text-gray-300 font-mono whitespace-pre-line">
                    <code>{`$ docgen g
$ docgen generate
$ docgen g [OPTIONS]`}</code>
                  </pre>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-200">Options</h4>
                  {[
                    {
                      param: "--file, -f PATH",
                      desc: "Path to a specific file",
                      optional: true,
                    },
                    {
                      param: "--current-dir, -cd",
                      desc: "Generate documentation for the current directory",
                      optional: true,
                    },
                    {
                      param: "--output-dir, -o PATH",
                      desc: "Output directory for the generated documentation",
                      optional: true,
                      note: "If not specified, documentation is created in the same directory as the source",
                    },
                    {
                      param: "--output-format FORMAT",
                      desc: "Output format (currently only markdown is supported)",
                      optional: true,
                      note: "Defaults to markdown",
                    },
                  ].map((option) => (
                    <div
                      key={option.param}
                      className="flex gap-4 items-start p-4 rounded-lg bg-[#111111]"
                    >
                      <code className="px-2 py-1 bg-[#1F1F1F] rounded text-sm font-mono text-emerald-500 whitespace-nowrap">
                        {option.param}
                      </code>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {option.desc}
                        </p>
                        {option.optional && (
                          <p className="text-sm text-gray-500">Optional</p>
                        )}
                        {option.note && (
                          <p className="text-sm text-gray-500">{option.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Generate Command Examples */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-200">
                    Examples
                  </h4>
                  <div className="bg-[#111111] rounded-lg p-4 group relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition bg-[#1F1F1F] hover:bg-[#2A2A2A] text-gray-400"
                    >
                      Copy
                    </Button>
                    <pre className="text-gray-300 font-mono whitespace-pre-line">
                      <code>{`$ docgen g  # Alias for generate
$ docgen generate # To generate docs for entire codebase
$ docgen g -f src/my_module.py -o docs/
$ docgen generate --current-dir
$ docgen g -cd -o ./output_docs`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Update Command */}
            <div id="update" className="mb-16">
              <h3 className="text-xl font-semibold mb-4">Update (u)</h3>
              <p className="text-gray-400 mb-4">
                Updates documentation for changed files since the last
                documentation generation. You can use either{" "}
                <code className="text-emerald-500">docgen update</code> or the
                shorter alias <code className="text-emerald-500">docgen u</code>{" "}
                to update documentation for changed files. This command is
                Git-aware.
              </p>
              <div className="space-y-6">
                <div className="bg-[#111111] rounded-lg p-4 group relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition bg-[#1F1F1F] hover:bg-[#2A2A2A] text-gray-400"
                  >
                    Copy
                  </Button>
                  <pre className="text-gray-300 font-mono whitespace-pre-line">
                    <code>{`$ docgen update
$ docgen u 
$ docgen u [OPTIONS]`}</code>
                  </pre>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-200">Options</h4>
                  {[
                    {
                      param: "--output-dir, -o PATH",
                      desc: "Output directory for the documentation",
                      note: "If not specified, documentation is updated in place",
                    },
                    {
                      param: "--full, -f",
                      desc: "Perform a full update, regenerating documentation for all changed files",
                    },
                    {
                      param: "--updates-file, -u FILE",
                      desc: "Store updates in a separate file",
                      note: "Updates will be stored separately while main documentation remains unchanged",
                    },
                  ].map((option) => (
                    <div
                      key={option.param}
                      className="flex gap-4 items-start p-4 rounded-lg bg-[#111111]"
                    >
                      <code className="px-2 py-1 bg-[#1F1F1F] rounded text-sm font-mono text-emerald-500 whitespace-nowrap">
                        {option.param}
                      </code>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {option.desc}
                        </p>
                        {option.note && (
                          <p className="text-sm text-gray-500">{option.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Update Command Examples */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-200">
                    Examples
                  </h4>
                  <div className="bg-[#111111] rounded-lg p-4 group relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition bg-[#1F1F1F] hover:bg-[#2A2A2A] text-gray-400"
                    >
                      Copy
                    </Button>
                    <pre className="text-gray-300 font-mono whitespace-pre-line">
                      <code>{`$ docgen update 
$ docgen u  # Alias for update
$ docgen u -o docs/
$ docgen update --full
$ docgen u -u updates.md`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Clean Command */}
            <div id="clean" className="mb-16">
              <h3 className="text-xl font-semibold mb-4">Clean (c)</h3>
              <p className="text-gray-400 mb-4">
                Removes generated documentation files (except README.md).
              </p>
              <div className="space-y-6">
                <div className="bg-[#111111] rounded-lg p-4 group relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition bg-[#1F1F1F] hover:bg-[#2A2A2A] text-gray-400"
                  >
                    Copy
                  </Button>
                  <pre className="text-gray-300 font-mono">
                    <code>
                      $ docgen clean [OPTIONS] $ docgen c [OPTIONS] # Alias
                    </code>
                  </pre>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-200">Options</h4>
                  <div className="flex gap-4 items-start p-4 rounded-lg bg-[#111111]">
                    <code className="px-2 py-1 bg-[#1F1F1F] rounded text-sm font-mono text-emerald-500">
                      --current-dir, -cd
                    </code>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Clean only the current directory
                      </p>
                      <p className="text-sm text-gray-500">
                        If not used, cleans the entire project
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-200">
                    Examples
                  </h4>
                  <div className="bg-[#111111] rounded-lg p-4 group relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition bg-[#1F1F1F] hover:bg-[#2A2A2A] text-gray-400"
                    >
                      Copy
                    </Button>
                    <pre className="text-gray-300 font-mono">
                      <code>$ docgen clean $ docgen c --current-dir</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Section - Moved to its own section */}
            <div id="usage" className="mb-16">
              <h3 className="text-xl font-semibold mb-4">Usage</h3>
              <p className="text-gray-400 mb-4">
                Display current usage statistics and limits for your account.
              </p>
              <div className="space-y-6">
                <div className="bg-[#111111] rounded-lg p-4 group relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition bg-[#1F1F1F] hover:bg-[#2A2A2A] text-gray-400"
                  >
                    Copy
                  </Button>
                  <pre className="text-gray-300 font-mono">
                    <code>$ docgen usage</code>
                  </pre>
                </div>

                <div className="bg-[#111111] rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-300 mb-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                    <span>Shows current month's usage</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300 mb-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                    <span>Displays remaining requests</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                    <span>Shows account type and limits</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Other Commands */}
            <div className="space-y-12">
              {[
                {
                  id: "clear-cache",
                  title: "Clear Cache",
                  description: "Clears the DocGen CLI cache.",
                  command: "$ docgen clear-cache",
                },
                {
                  id: "version",
                  title: "Version",
                  description: "Displays the DocGen CLI version.",
                  command: "$ docgen version",
                },
                {
                  id: "config",
                  title: "Config (Under Development)",
                  description: "Manages DocGen CLI configuration.",
                  command: "$ docgen config KEY [VALUE]",
                  examples: [
                    "$ docgen config output_format",
                    "$ docgen config output_format html  # Not yet supported",
                  ],
                },
              ].map((cmd) => (
                <div key={cmd.id} id={cmd.id} className="mb-12">
                  <h3 className="text-xl font-semibold mb-4">{cmd.title}</h3>
                  <p className="text-gray-400 mb-4">{cmd.description}</p>
                  <div className="bg-[#111111] rounded-lg p-4 group relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition bg-[#1F1F1F] hover:bg-[#2A2A2A] text-gray-400"
                    >
                      Copy
                    </Button>
                    <pre className="text-gray-300 font-mono">
                      <code>{cmd.command}</code>
                    </pre>
                  </div>
                  {cmd.examples && (
                    <div className="mt-4">
                      <h4 className="text-lg font-medium text-gray-200 mb-3">
                        Examples
                      </h4>
                      <div className="bg-[#111111] rounded-lg p-4">
                        <pre className="text-gray-300 font-mono">
                          <code>{cmd.examples.join("\n")}</code>
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default DocsPage;

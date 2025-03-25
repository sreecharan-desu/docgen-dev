import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Terminal, FileCode, Info, Key, Command, Menu, X, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-16 m-0">
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-md bg-[#111111] text-white hover:bg-[#1F1F1F] transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Left Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-72 bg-[#111111] border-r border-[#1F1F1F] overflow-y-auto transition-transform duration-300 z-40",
          "md:translate-x-0 md:top-16 md:h-[calc(100vh-4rem)]",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 md:p-6">
          <button
            className="flex items-center justify-center p-1 mb-4 text-white hover:text-emerald-500 transition-colors rounded-full hover:bg-slate-700/50 md:mb-6"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
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
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="w-full md:ml-72 min-h-screen bg-[#0A0A0A] text-white">
        <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 md:px-8 sm:py-12">
          <style global="true">{`
            section,
            section > div[id],
            section div[id] {
              scroll-margin-top: 5rem;
            }
            @media (min-width: 768px) {
              section,
              section > div[id],
              section div[id] {
                scroll-margin-top: 6rem;
              }
            }
          `}</style>

          {/* Header Section */}
          <div className="mb-10 sm:mb-12 md:mb-16">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 md:mb-6">
              Documentation
            </h1>
            <p className="text-gray-400 text-sm sm:text-base md:text-lg">
              Learn how to use DocGen CLI to generate AI-powered documentation.
            </p>
          </div>

          {/* Installation */}
          <section id="installation" className="mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4 md:mb-6">
              Installation
            </h2>
            <p className="text-gray-400 mb-4 text-sm sm:text-base">
              Install DocGen using pip package manager:
            </p>
            <div className="bg-[#111111] rounded-lg p-3 sm:p-4 mb-4 group relative overflow-x-auto">
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 sm:right-3 sm:top-3 opacity-0 group-hover:opacity-100 transition bg-[#1F1F1F] hover:bg-[#2A2A2A] text-gray-400"
              >
                Copy
              </Button>
              <pre className="text-gray-300 font-mono text-sm sm:text-base overflow-x-auto">
                <code>$ pip install docgen-cli</code>
              </pre>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
              <Info className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Requires Python 3.7 or higher</span>
            </div>
          </section>

          {/* Authentication */}
          <section id="authentication" className="mb-10 sm:mb-12 md:mb-16">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 md:mb-6">
              <div className="p-1.5 sm:p-2 rounded-md bg-emerald-500/10">
                <Key className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-emerald-500" />
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">
                Authentication
              </h2>
            </div>

            {/* Anonymous Usage */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 md:mb-4">
                Anonymous Usage
              </h3>
              <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">
                You can start using DocGen CLI immediately without authentication. Anonymous users get:
              </p>
              <div className="bg-[#111111] rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm md:text-base text-gray-300">
                  <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500"></div>
                  <span>20 free requests per month</span>
                </div>
                <div className="mt-2 text-xs sm:text-sm text-gray-500">
                  No API key required. Just install and start using:
                </div>
                <pre className="mt-2 sm:mt-3 text-gray-300 font-mono text-xs sm:text-sm md:text-base overflow-x-auto">
                  <code>$ docgen generate</code>
                </pre>
              </div>
            </div>

            {/* API Key Authentication */}
            <div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 md:mb-4">
                API Key Authentication
              </h3>
              <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">
                Authenticate with an API key to get additional benefits:
              </p>
              <div className="bg-[#111111] rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 text-xs sm:text-sm md:text-base text-gray-300 mb-2 sm:mb-3">
                  <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500"></div>
                  <span>30 additional free requests (total 50 requests per month)</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm md:text-base text-gray-300 mb-3 sm:mb-4">
                  <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500"></div>
                  <span>Access to premium features</span>
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
                  Get your API key from the dashboard and authenticate:
                </div>
                <div className="bg-[#1F1F1F] rounded-lg p-2 sm:p-3 md:p-4 group relative overflow-x-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 sm:right-2 sm:top-2 md:right-3 md:top-3 opacity-0 group-hover:opacity-100 transition bg-[#2A2A2A] hover:bg-[#333333] text-gray-400"
                  >
                    Copy
                  </Button>
                  <pre className="text-gray-300 font-mono text-xs sm:text-sm md:text-base overflow-x-auto">
                    <code>$ docgen auth login --key=YOUR_API_KEY</code>
                  </pre>
                </div>
              </div>

              {/* Usage Tracking */}
              <div className="flex items-start gap-2 p-2 sm:p-3 md:p-4 rounded-lg bg-[#111111] border border-[#1F1F1F]">
                <Info className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs sm:text-sm md:text-base text-gray-300">
                    Track your usage
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Check your current usage and remaining requests:
                  </p>
                  <pre className="mt-1 sm:mt-2 text-gray-300 font-mono text-xs sm:text-sm md:text-base overflow-x-auto">
                    <code>$ docgen usage</code>
                  </pre>
                </div>
              </div>
            </div>
          </section>

          {/* Commands */}
          <section id="commands" className="mb-10 sm:mb-12 md:mb-16">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 md:mb-8">
              <div className="p-1.5 sm:p-2 rounded-md bg-emerald-500/10">
                <Command className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-emerald-500" />
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">Commands</h2>
            </div>

            {/* Generate Command */}
            <div id="generate" className="mb-12 sm:mb-14 md:mb-16">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4">
                Generate (g)
              </h3>
              <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">
                Generates documentation for a file or directory. Use either{" "}
                <code className="text-emerald-500">docgen generate</code> or{" "}
                <code className="text-emerald-500">docgen g</code>.
              </p>
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-[#111111] rounded-lg p-3 sm:p-4 group relative overflow-x-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2 sm:right-3 sm:top-3 opacity-0 group-hover:opacity-100 transition bg-[#1F1F1F] hover:bg-[#2A2A2A] text-gray-400"
                  >
                    Copy
                  </Button>
                  <pre className="text-gray-300 font-mono text-xs sm:text-sm md:text-base whitespace-pre-line">
                    <code>{`$ docgen g
$ docgen generate
$ docgen g [OPTIONS]`}</code>
                  </pre>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-sm sm:text-base md:text-lg font-medium text-gray-200">
                    Options
                  </h4>
                  {[
                    { param: "--file, -f PATH", desc: "Path to a specific file", optional: true },
                    { param: "--current-dir, -cd", desc: "Generate documentation for the current directory", optional: true },
                    { param: "--output-dir, -o PATH", desc: "Output directory for the generated documentation", optional: true, note: "If not specified, uses source directory" },
                    { param: "--output-format FORMAT", desc: "Output format (markdown only)", optional: true, note: "Defaults to markdown" },
                  ].map((option) => (
                    <div key={option.param} className="flex gap-2 sm:gap-4 items-start p-2 sm:p-3 md:p-4 rounded-lg bg-[#111111]">
                      <code className="px-1.5 py-1 bg-[#1F1F1F] rounded text-xs sm:text-sm font-mono text-emerald-500 whitespace-nowrap">
                        {option.param}
                      </code>
                      <div>
                        <p className="text-xs sm:text-sm md:text-base font-medium text-white">{option.desc}</p>
                        {option.optional && <p className="text-xs sm:text-sm text-gray-500">Optional</p>}
                        {option.note && <p className="text-xs sm:text-sm text-gray-500">{option.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-sm sm:text-base md:text-lg font-medium text-gray-200">
                    Examples
                  </h4>
                  <div className="bg-[#111111] rounded-lg p-3 sm:p-4 group relative overflow-x-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2 sm:right-3 sm:top-3 opacity-0 group-hover:opacity-100 transition bg-[#1F1F1F] hover:bg-[#2A2A2A] text-gray-400"
                    >
                      Copy
                    </Button>
                    <pre className="text-gray-300 font-mono text-xs sm:text-sm md:text-base whitespace-pre-line">
                      <code>{`$ docgen g
$ docgen generate
$ docgen g -f src/my_module.py -o docs/
$ docgen generate --current-dir
$ docgen g -cd -o ./output_docs`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Update Command */}
            <div id="update" className="mb-12 sm:mb-14 md:mb-16">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4">
                Update (u)
              </h3>
              <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">
                Updates documentation for changed files. Use{" "}
                <code className="text-emerald-500">docgen update</code> or{" "}
                <code className="text-emerald-500">docgen u</code>. Git-aware.
              </p>
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-[#111111] rounded-lg p-3 sm:p-4 group relative overflow-x-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2 sm:right-3 sm:top-3 opacity-0 group-hover:opacity-100 transition bg-[#1F1F1F] hover:bg-[#2A2A2A] text-gray-400"
                  >
                    Copy
                  </Button>
                  <pre className="text-gray-300 font-mono text-xs sm:text-sm md:text-base whitespace-pre-line">
                    <code>{`$ docgen update
$ docgen u
$ docgen u [OPTIONS]`}</code>
                  </pre>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-sm sm:text-base md:text-lg font-medium text-gray-200">
                    Options
                  </h4>
                  {[
                    { param: "--output-dir, -o PATH", desc: "Output directory for the documentation", note: "Defaults to in-place update" },
                    { param: "--full, -f", desc: "Perform a full update for all changed files" },
                    { param: "--updates-file, -u FILE", desc: "Store updates in a separate file", note: "Keeps main docs unchanged" },
                  ].map((option) => (
                    <div key={option.param} className="flex gap-2 sm:gap-4 items-start p-2 sm:p-3 md:p-4 rounded-lg bg-[#111111]">
                      <code className="px-1.5 py-1 bg-[#1F1F1F] rounded text-xs sm:text-sm font-mono text-emerald-500 whitespace-nowrap">
                        {option.param}
                      </code>
                      <div>
                        <p className="text-xs sm:text-sm md:text-base font-medium text-white">{option.desc}</p>
                        {option.note && <p className="text-xs sm:text-sm text-gray-500">{option.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-sm sm:text-base md:text-lg font-medium text-gray-200">
                    Examples
                  </h4>
                  <div className="bg-[#111111] rounded-lg p-3 sm:p-4 group relative overflow-x-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2 sm:right-3 sm:top-3 opacity-0 group-hover:opacity-100 transition bg-[#1F1F1F] hover:bg-[#2A2A2A] text-gray-400"
                    >
                      Copy
                    </Button>
                    <pre className="text-gray-300 font-mono text-xs sm:text-sm md:text-base whitespace-pre-line">
                      <code>{`$ docgen update
$ docgen u
$ docgen u -o docs/
$ docgen update --full
$ docgen u -u updates.md`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Clean Command */}
            <div id="clean" className="mb-12 sm:mb-14 md:mb-16">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4">
                Clean (c)
              </h3>
              <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">
                Removes generated documentation files (except README.md).
              </p>
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-[#111111] rounded-lg p-3 sm:p-4 group relative overflow-x-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2 sm:right-3 sm:top-3 opacity-0 group-hover:opacity-100 transition bg-[#1F1F1F] hover:bg-[#2A2A2A] text-gray-400"
                  >
                    Copy
                  </Button>
                  <pre className="text-gray-300 font-mono text-xs sm:text-sm md:text-base">
                    <code>$ docgen clean [OPTIONS] $ docgen c [OPTIONS]</code>
                  </pre>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-sm sm:text-base md:text-lg font-medium text-gray-200">
                    Options
                  </h4>
                  <div className="flex gap-2 sm:gap-4 items-start p-2 sm:p-3 md:p-4 rounded-lg bg-[#111111]">
                    <code className="px-1.5 py-1 bg-[#1F1F1F] rounded text-xs sm:text-sm font-mono text-emerald-500 whitespace-nowrap">
                      --current-dir, -cd
                    </code>
                    <div>
                      <p className="text-xs sm:text-sm md:text-base font-medium text-white">
                        Clean only the current directory
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Otherwise cleans entire project
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-sm sm:text-base md:text-lg font-medium text-gray-200">
                    Examples
                  </h4>
                  <div className="bg-[#111111] rounded-lg p-3 sm:p-4 group relative overflow-x-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2 sm:right-3 sm:top-3 opacity-0 group-hover:opacity-100 transition bg-[#1F1F1F] hover:bg-[#2A2A2A] text-gray-400"
                    >
                      Copy
                    </Button>
                    <pre className="text-gray-300 font-mono text-xs sm:text-sm md:text-base">
                      <code>$ docgen clean $ docgen c --current-dir</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Section */}
            <div id="usage" className="mb-12 sm:mb-14 md:mb-16">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4">
                Usage
              </h3>
              <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">
                Display current usage statistics and limits for your account.
              </p>
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-[#111111] rounded-lg p-3 sm:p-4 group relative overflow-x-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2 sm:right-3 sm:top-3 opacity-0 group-hover:opacity-100 transition bg-[#1F1F1F] hover:bg-[#2A2A2A] text-gray-400"
                  >
                    Copy
                  </Button>
                  <pre className="text-gray-300 font-mono text-xs sm:text-sm md:text-base">
                    <code>$ docgen usage</code>
                  </pre>
                </div>

                <div className="bg-[#111111] rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-xs sm:text-sm md:text-base text-gray-300 mb-1 sm:mb-2">
                    <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500"></div>
                    <span>Shows current month's usage</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm md:text-base text-gray-300 mb-1 sm:mb-2">
                    <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500"></div>
                    <span>Displays remaining requests</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm md:text-base text-gray-300">
                    <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500"></div>
                    <span>Shows account type and limits</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Other Commands */}
            <div className="space-y-8 sm:space-y-10 md:space-y-12">
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
                <div key={cmd.id} id={cmd.id} className="mb-8 sm:mb-10 md:mb-12">
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4">
                    {cmd.title}
                  </h3>
                  <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">{cmd.description}</p>
                  <div className="bg-[#111111] rounded-lg p-3 sm:p-4 group relative overflow-x-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2 sm:right-3 sm:top-3 opacity-0 group-hover:opacity-100 transition bg-[#1F1F1F] hover:bg-[#2A2A2A] text-gray-400"
                    >
                      Copy
                    </Button>
                    <pre className="text-gray-300 font-mono text-xs sm:text-sm md:text-base">
                      <code>{cmd.command}</code>
                    </pre>
                  </div>
                  {cmd.examples && (
                    <div className="mt-3 sm:mt-4">
                      <h4 className="text-sm sm:text-base md:text-lg font-medium text-gray-200 mb-2 sm:mb-3">
                        Examples
                      </h4>
                      <div className="bg-[#111111] rounded-lg p-3 sm:p-4 overflow-x-auto">
                        <pre className="text-gray-300 font-mono text-xs sm:text-sm md:text-base">
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
export const API_URL = (
  window.location.hostname === 'localhost'
    ? 'https://api2.docgen.dev'
    : 'https://api1.docgen.dev'
);

export const getBaseUrl = () => window.location.origin;

export const GITHUB_CLIENT_ID = 'Ov23livmcOJdTGJwAtnB';

export const GOOGLE_CALLBACK_URL = window.location.hostname === 'localhost'
  ? 'https://api2.docgen.dev/api/v1/auth/google-auth-callback'
  : 'https://api1.docgen.dev/api/v1/auth/google-auth-callback';

export const GITHUB_CALLBACK_URL = window.location.hostname === 'localhost'
  ? 'https://api2.docgen.dev/api/v1/auth/github-auth-callback'
  : 'https://api1.docgen.dev/api/v1/auth/github-auth-callback';


  export const TEXT_FILE_EXTENSIONS = [
    // Existing extensions
    '.txt', '.py', '.js', '.ts', '.jsx', '.tsx', '.html', '.css', '.json', '.md', '.java', '.cpp', '.c', '.rb',
  
    // Additional programming languages
    '.go',        // Go (Golang)
    '.rs',        // Rust
    '.kt',        // Kotlin
    '.kts',       // Kotlin Script
    '.scala',     // Scala
    '.sc',        // Scala (alternative)
    '.swift',     // Swift
    '.m',         // Objective-C
    '.mm',        // Objective-C++
    '.cs',        // C#
    '.fs',        // F#
    '.vb',        // Visual Basic
    '.r',         // R
    '.pl',        // Perl
    '.pm',        // Perl Module
    '.php',       // PHP
    '.phtml',     // PHP (alternative)
    '.lua',       // Lua
    '.dart',      // Dart
    '.erl',       // Erlang
    '.ex',        // Elixir
    '.exs',       // Elixir Script
    '.hs',        // Haskell
    '.lhs',       // Literate Haskell
    '.clj',       // Clojure
    '.cljs',      // ClojureScript
    '.groovy',    // Groovy
    '.gvy',       // Groovy (alternative)
    '.jl',        // Julia
    '.sh',        // Shell Script (Bash)
    '.bash',      // Bash Script
    '.zsh',       // Zsh Script
    '.fish',      // Fish Shell Script
    '.ps1',       // PowerShell
    '.bat',       // Batch Script (Windows)
    '.cmd',       // Command Script (Windows)
    '.v',         // Verilog
    '.vhdl',      // VHDL
    '.sv',        // SystemVerilog
    '.asm',       // Assembly
    '.s',         // Assembly (alternative)
    '.nasm',      // Netwide Assembler
    '.f',         // Fortran
    '.f90',       // Fortran 90
    '.f95',       // Fortran 95
    '.pas',       // Pascal
    '.dpr',       // Delphi (Pascal)
    '.ada',       // Ada
    '.adb',       // Ada Body
    '.ads',       // Ada Specification
    '.cob',       // COBOL
    '.cbl',       // COBOL (alternative)
    '.ml',        // OCaml
    '.mli',       // OCaml Interface
    '.elm',       // Elm
    '.purs',      // PureScript
    '.nim',       // Nim
    '.cr',        // Crystal
    '.rkt',       // Racket
    '.scm',       // Scheme
    '.ss',        // Scheme (alternative)
    '.lisp',      // Lisp
    '.cl',        // Common Lisp
    '.matlab',    // MATLAB
    '.m',         // MATLAB (alternative, also used for Objective-C, so context matters)
    '.oct',       // Octave
    '.pro',       // Prolog
    '.pl',        // Prolog (alternative, also used for Perl, so context matters)
    '.d',         // D
    '.zig',       // Zig
    '.v',         // V
    '.vala',      // Vala
    '.vapi',      // Vala API
    '.h',         // C/C++ Header
    '.hpp',       // C++ Header
    '.hxx',       // C++ Header (alternative)
    '.hh',        // C++ Header (alternative)
    '.inl',       // C++ Inline
  
    // Web development and markup languages
    '.xml',       // XML
    '.svg',       // SVG (XML-based)
    '.xhtml',     // XHTML
    '.vue',       // Vue.js
    '.svelte',    // Svelte
    '.astro',     // Astro
    '.ejs',       // Embedded JavaScript templates
    '.erb',       // Embedded Ruby (ERB)
    '.haml',      // HAML
    '.pug',       // Pug (formerly Jade)
    '.jade',      // Jade (older name for Pug)
    '.scss',      // SCSS (Sass)
    '.sass',      // Sass
    '.less',      // LESS
    '.styl',      // Stylus
  
    // Configuration and data formats
    '.yaml',      // YAML
    '.yml',       // YAML (alternative)
    '.toml',      // TOML
    '.ini',       // INI
    '.cfg',       // Configuration files
    '.conf',      // Configuration files
    '.env',       // Environment variables
    '.properties',// Java Properties
    '.csv',       // Comma-Separated Values
    '.tsv',       // Tab-Separated Values
  
    // Documentation and markup
    '.rst',       // reStructuredText
    '.adoc',      // AsciiDoc
    '.tex',       // LaTeX
    '.bib',       // BibTeX
    '.org',       // Org-mode (Emacs)
  
    // Build and scripting tools
    '.make',      // Makefile (sometimes extensionless, but included for clarity)
    '.mk',        // Makefile (alternative)
    '.gradle',    // Gradle (Groovy-based)
    '.kts',       // Gradle Kotlin Script (already included under Kotlin)
    '.cmake',     // CMake
    '.ninja',     // Ninja build system
    '.dockerfile',// Dockerfile (sometimes extensionless, but included for clarity)
    '.lock',      // Lock files (e.g., package-lock.json, though often paired with .json)
  
    // Other text-based formats
    '.sql',       // SQL
    '.graphql',   // GraphQL
    '.gql',       // GraphQL (alternative)
    '.proto',     // Protocol Buffers
    '.thrift',    // Apache Thrift
    '.avsc',      // Avro Schema
    '.log',       // Log files
    '.diff',      // Diff/Patch files
    '.patch',     // Patch files
  ];
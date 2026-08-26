# TensorBoard patches using patch-package.

We use [patch-package](https://www.npmjs.com/package/patch-package) to author
TensorBoard-specific patches to some of our npm/yarn dependencies.

At build time, `WORKSPACE` and the transitional `WORKSPACE.bzlmod` apply the
generated patch artifacts via `yarn_install(post_install_patches = ...)`
instead of invoking `patch-package` inside the repository rule. In the current
Bazel/CI setup, that install-time invocation was less reliable than applying
the generated patch files directly.

After creating or updating a patch, ensure there is no trailing whitespace on
any line (CI runs `./tensorboard/tools/whitespace_hygiene_test.py`). You can
strip it with `sed -i '' 's/[[:space:]]*$//' patches/<patch-file>.patch`.

**Important:** `patch-package` defaults to `--exclude '/package\.json$/'`, so a
plain `yarn patch-package "<pkg>"` silently drops any changes to the package's
`package.json`. Pass `--exclude '^$'` whenever the patch needs to modify that
file, and always review `git diff patches/` after regenerating to confirm no
hunk disappeared.

## `@bazel+concatjs+5.8.1.patch`

**Modified files:**
* `node_modules/@bazel/concatjs/internal/common/compilation.bzl`
* `node_modules/@bazel/concatjs/internal/common/tsconfig.bzl`
* `node_modules/@bazel/concatjs/package.json`

**What it does:**
Three independent changes:

1. `compilation.bzl` stops declaring `*.ngfactory.*` and `*.ngsummary.*` outputs
   when `use_angular_plugin = True`. Ivy no longer emits those files, so Bazel
   failed with "declared output was not created".
2. `tsconfig.bzl` adds `module_roots` entries mapping each Angular, Material,
   CDK and NgRx entry point to its `types/<name>.d.ts` file. Starting with
   Angular 21, APF packaging exposes type definitions only through
   `package.json` `"exports"`, which the Bazel `node_modules` path mapping
   cannot resolve.
3. `package.json` adds `typescript` as a direct dependency because the Bazel
   sandbox cannot find it otherwise.

Note that putting the mappings from (2) in the workspace `tsconfig.json` does not
work: the tsconfig Bazel generates does `extends` the workspace one, but it also
writes its own `compilerOptions.paths`, and TypeScript replaces `paths` wholesale
instead of merging it.

Why 5.8.1 and not 6.x: rules_nodejs 6.x removed most of the build rules we depend on (concatjs, esbuild, typescript, etc.) and moved them to a separate project (rules_js). This effort will be done in future upgrades.

Removal is planned. `@bazel/concatjs` 5.8.1 is the last published version and
rules_nodejs is archived, so no upstream fix is coming. The near-term plan is to
move the `tsconfig.bzl` mappings and the `compilation.bzl` outputs override into
a TensorBoard-owned `ts_library` rule under `tensorboard/defs`, which reuses
concatjs `compile_ts` without patching it. See the `TODO` in the `tsconfig.bzl`
hunk.

To regenerate:
* `vi node_modules/@bazel/concatjs/internal/common/compilation.bzl`
* `vi node_modules/@bazel/concatjs/internal/common/tsconfig.bzl`
* `vi node_modules/@bazel/concatjs/package.json`
* make edits
* `yarn patch-package "@bazel/concatjs" --exclude '^$'` (the `--exclude` is
  required, otherwise the `package.json` hunk is dropped)
* update the WORKSPACE file with the name of the new patch file


## `@angular+build-tooling+0.0.0-98b30ab5fdeeb1df3278f5257b9a8f07abb76941.patch`

**Modified files:**
* `node_modules/@angular/build-tooling/shared-scripts/angular-optimization/esbuild-plugin.mjs`

**What it does:**
Disables the `markTopLevelPure` optimization plugin, which culls top-level
function calls that TensorBoard depends on at runtime. Without this, the app
bundles to a blank page with no console error. The resulting bundle is larger.

Note the patch file name tracks the pinned `@angular/build-tooling` commit, so it
has to be renamed (and the WORKSPACE reference updated) whenever that dependency
is bumped.

Removal is planned along with the concatjs patch. `@angular/build-tooling` is
frozen upstream, and both patches only go away once the frontend build moves off
rules_nodejs.

To regenerate:
* `vi node_modules/@angular/build-tooling/shared-scripts/angular-optimization/esbuild-plugin.mjs`
* make edits
* `yarn patch-package "@angular/build-tooling"`
* update the WORKSPACE file with the name of the new patch file


## `protobuf_6_31_1_java_export.patch`

**Modified files:**
- `build_defs/java_opts.bzl`
- `bazel/private/proto_library_rule.bzl`

**What it does:**
- Drops the older javadocopts workaround from protobuf's Java export helper on
  the current rules_java/protobuf stack.
- Relaxes the import-prefix normalization check so empty-but-normalized values
  continue to work under the newer path handling used here.

## `protobuf_6_31_1_bzlmod.patch`

**Modified files:**
- `MODULE.bazel`

**What it does:**
This patch fixes two downstream-consumer issues in protobuf 6.31.1's own
`MODULE.bazel`. Protobuf supports Bazel, but its public `//python/dist` targets
depend on repositories that this release's module metadata does not expose
correctly when protobuf is a dependency rather than the root module:

- The apparent `@system_python` name points to a rules_python toolchain
  repository, which does not provide the `version.bzl` and Python-header
  targets that `//python/dist` expects. The patch creates protobuf's intended
  system-Python repository under that name instead.
- `//python/dist` loads `@protobuf_pip_deps`, but protobuf declares the pip
  extension that creates it as development-only. The patch makes the extension
  available to downstream modules such as TensorBoard.

Removal is planned once protobuf's own module metadata provides both
repositories to downstream consumers without a source override.


## `rules_cc_protobuf.patch`

**Modified files:**
- `cc/defs.bzl`

**What it does:**
- Re-exports `cc_proto_library` from protobuf's Bazel definitions so callers on
  this repository can keep loading the symbol through `rules_cc` while using the
  protobuf 6.31.1 repository layout.


## `rules_closure_soy_cli.patch`

**Modified files:**
- `closure/templates/closure_java_template_library.bzl`

**What it does:**
- Updates rules_closure's Soy invocation for the compiler/jar combination used
  here.
- Switches to the `--depHeaders` flag expected by this compiler and drops the
  older `--allowExternalCalls` flag that is not accepted here.


## `rules_closure_bzlmod.patch`

**Modified files:**
- `closure/defs.bzl`

**What it does:**
- Removes the unused `setup_web_test_repositories` export from the pinned
  Closure snapshot. That helper eagerly loads repository macros removed from
  rules_webtesting 0.4.1, even though TensorBoard never calls the helper.
- Lets TensorBoard consume `rules_webtesting` and
  `rules_web_testing_python` as Bazel modules while retaining the existing
  Bazel-7-compatible Closure/Soy setup.

Removal is planned when TensorBoard moves to a module-native Closure release
whose public definitions no longer load the legacy web-testing setup.


## `rules_web_testing_python_py310.patch`

**Modified files:**
- `MODULE.bazel`

**What it does:**
- Changes the rules_web_testing_python 0.4.1 toolchain and pip-wheel tags from
  Python 3.11 to TensorBoard's hermetic Python 3.10 baseline.
- Prevents its Selenium target from selecting a Python-3.11-only wheel while
  TensorBoard analyzes functional tests with Python 3.10.

Removal is planned when rules_web_testing_python lets the root module select
the Python version instead of hardcoding it in the dependency module.

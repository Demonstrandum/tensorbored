load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_ng_web_test_suite", "tf_sass_binary", "tf_ts_library")
load("@rules_python//python:py_binary.bzl", "py_binary")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_sass_binary(
    name = "debugger_component_style",
    src = "debugger_component.scss",
    deps = ["//tensorbored/webapp/theme"],
)

# TODO(cais): Consider replacing old debuger plugin with this before launch,
# instead of having two versions of debugger co-exist, which may be confusing to
# users.
tf_ng_module(
    name = "debugger_v2",
    srcs = [
        "debugger_component.ts",
        "debugger_container.ts",
        "debugger_module.ts",
    ],
    assets = [
        ":debugger_component_style",
        "debugger_component.ng.html",
    ],
    deps = [
        ":types",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/actions",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/data_source",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/effects",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/store",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/store:types",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/alerts",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/graph",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/graph_executions",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/inactive",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/source_files",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/stack_trace",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/timeline",
        "//tensorbored/webapp/core",
        "//tensorbored/webapp/plugins:plugin_registry",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@ngrx/effects",
        "@npm//@ngrx/store",
        "@npm//rxjs",
    ],
)

tf_ts_library(
    name = "types",
    srcs = [
        "types.ts",
    ],
)

tf_ts_library(
    name = "test_lib",
    testonly = True,
    srcs = [
        "debugger_container_test.ts",
    ],
    deps = [
        ":debugger_v2",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/actions",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/store",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/store:types",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/testing",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/alerts",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/execution_data",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/graph",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/graph_executions",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/inactive",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/source_files",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/stack_trace",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/timeline",
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "//tensorbored/webapp/angular:expect_ngrx_store_testing",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@angular/platform-browser",
        "@npm//@ngrx/store",
        "@npm//@types/jasmine",
    ],
)

tf_ng_web_test_suite(
    name = "karma_test",
    deps = [
        ":test_lib",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/effects:debugger_effects_test_lib",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/store:debugger_store_test_lib",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/alerts:alerts_container_test_lib",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/debug_tensor_value:debug_tensor_value_component_test_lib",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/execution_data:execution_data_container_test_lib",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/graph:graph_container_test_lib",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/graph_executions:graph_executions_container_test_lib",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/source_files:source_files_container_test_lib",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/stack_trace:stack_trace_container_test_lib",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/timeline:timeline_container_test_lib",
    ],
)

py_binary(
    name = "extract_dtypes_from_python",
    srcs = ["extract_dtypes_from_python.py"],
    python_version = "PY3",
    srcs_version = "PY3",
    deps = [
        "//tensorbored/compat/tensorflow_stub",
    ],
)

genrule(
    name = "generate_dtypes",
    outs = ["tf_dtypes.ts"],
    cmd = "$(execpath :extract_dtypes_from_python) $@",
    tools = [
        ":extract_dtypes_from_python",
    ],
)

tf_ts_library(
    name = "tf_types",
    srcs = [
        "tf_dtypes.ts",
    ],
)

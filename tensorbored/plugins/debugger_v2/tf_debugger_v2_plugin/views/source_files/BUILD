load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_sass_binary", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_sass_binary(
    name = "source_files_component_style",
    src = "source_files_component.scss",
    deps = ["//tensorbored/webapp/theme"],
)

tf_ng_module(
    name = "source_files",
    srcs = [
        "source_files_component.ts",
        "source_files_container.ts",
        "source_files_module.ts",
    ],
    assets = [
        ":source_files_component_style",
        "source_files_component.ng.html",
    ],
    deps = [
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/store",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/store:types",
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp:selectors",
        "//tensorbored/webapp/widgets/source_code",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@ngrx/store",
        "@npm//rxjs",
    ],
)

tf_ts_library(
    name = "source_files_container_test_lib",
    testonly = True,
    srcs = [
        "source_files_container_test.ts",
    ],
    deps = [
        ":source_files",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin:debugger_v2",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/store",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/store:types",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/testing",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/alerts",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/execution_data",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/graph_executions",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/inactive",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/stack_trace",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/timeline",
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp:selectors",
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "//tensorbored/webapp/angular:expect_ngrx_store_testing",
        "//tensorbored/webapp/testing:utils",
        "//tensorbored/webapp/widgets/source_code:load_monaco",
        "//tensorbored/webapp/widgets/source_code:testing",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@angular/platform-browser",
        "@npm//@ngrx/store",
        "@npm//@types/jasmine",
    ],
)

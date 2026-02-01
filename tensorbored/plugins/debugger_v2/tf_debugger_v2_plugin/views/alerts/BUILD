load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ng_module(
    name = "alerts",
    srcs = [
        "alerts_component.ts",
        "alerts_container.ts",
        "alerts_module.ts",
    ],
    assets = [
        "alerts_component.css",
        "alerts_component.ng.html",
    ],
    deps = [
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/actions",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/store",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/store:types",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@ngrx/store",
        "@npm//rxjs",
    ],
)

tf_ts_library(
    name = "alerts_container_test_lib",
    testonly = True,
    srcs = [
        "alerts_container_test.ts",
    ],
    deps = [
        ":alerts",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin:debugger_v2",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/actions",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/store",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/store:types",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/testing",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/execution_data",
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

load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_sass_binary", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_sass_binary(
    name = "graph_executions_styles",
    src = "graph_executions_component.scss",
    deps = [
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/common:style_lib",
        "//tensorbored/webapp/theme",
    ],
)

tf_ng_module(
    name = "graph_executions",
    srcs = [
        "graph_executions_component.ts",
        "graph_executions_container.ts",
        "graph_executions_module.ts",
    ],
    assets = [
        ":graph_executions_styles",
        "graph_executions_component.ng.html",
    ],
    deps = [
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/actions",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/store",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/store:debug_tensor_value",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/store:types",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/debug_tensor_value",
        "//tensorbored/webapp/angular:expect_angular_cdk_scrolling",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@ngrx/store",
        "@npm//rxjs",
    ],
)

tf_ts_library(
    name = "graph_executions_container_test_lib",
    testonly = True,
    srcs = [
        "graph_executions_container_test.ts",
    ],
    deps = [
        ":graph_executions",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin:debugger_v2",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/actions",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/store",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/store:types",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/testing",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/alerts",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/debug_tensor_value",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/execution_data",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/inactive",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/source_files",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/stack_trace",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/timeline",
        "//tensorbored/webapp/angular:expect_angular_cdk_scrolling",
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "//tensorbored/webapp/angular:expect_ngrx_store_testing",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@angular/platform-browser",
        "@npm//@ngrx/store",
        "@npm//@types/jasmine",
    ],
)

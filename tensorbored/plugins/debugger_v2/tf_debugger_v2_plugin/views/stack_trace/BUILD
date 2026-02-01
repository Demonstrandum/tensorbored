load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_sass_binary", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_sass_binary(
    name = "stack_trace_styles",
    src = "stack_trace_component.scss",
    deps = [
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/views/common:style_lib",
        "//tensorbored/webapp/theme",
    ],
)

tf_ng_module(
    name = "stack_trace",
    srcs = [
        "stack_trace_component.ts",
        "stack_trace_container.ts",
        "stack_trace_module.ts",
    ],
    assets = [
        ":stack_trace_styles",
        "stack_trace_component.ng.html",
    ],
    deps = [
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/actions",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/store",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/store:types",
        "//tensorbored/webapp/widgets/source_code",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@ngrx/store",
        "@npm//rxjs",
    ],
)

tf_ts_library(
    name = "stack_trace_container_test_lib",
    testonly = True,
    srcs = [
        "stack_trace_container_test.ts",
    ],
    deps = [
        ":stack_trace",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin:debugger_v2",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/actions",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/store",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/store:types",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/testing",
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "//tensorbored/webapp/angular:expect_ngrx_store_testing",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@angular/platform-browser",
        "@npm//@ngrx/store",
        "@npm//@types/jasmine",
    ],
)

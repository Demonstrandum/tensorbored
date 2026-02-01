load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ts_library(
    name = "actions",
    srcs = [
        "debugger_actions.ts",
        "index.ts",
    ],
    deps = [
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/data_source",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/store:types",
        "@npm//@ngrx/store",
    ],
)

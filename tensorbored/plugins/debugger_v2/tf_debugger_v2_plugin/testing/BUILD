load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

tf_ts_library(
    name = "testing",
    testonly = True,
    srcs = ["index.ts"],
    deps = [
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/store",
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin/store:types",
        "@npm//@angular/core",
        "@npm//@ngrx/store",
    ],
)

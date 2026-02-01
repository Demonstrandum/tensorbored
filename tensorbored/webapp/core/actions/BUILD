load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

tf_ts_library(
    name = "actions",
    srcs = [
        "core_actions.ts",
        "index.ts",
    ],
    deps = [
        "//tensorbored/webapp/core:types",
        "//tensorbored/webapp/types",
        "@npm//@ngrx/store",
    ],
)

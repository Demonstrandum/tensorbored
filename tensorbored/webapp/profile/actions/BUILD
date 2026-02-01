load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ts_library(
    name = "actions",
    srcs = [
        "index.ts",
        "profile_actions.ts",
    ],
    deps = [
        "//tensorbored/webapp/profile:types",
        "@npm//@ngrx/store",
    ],
)

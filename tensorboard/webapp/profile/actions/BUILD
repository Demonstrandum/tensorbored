load("//tensorboard/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorboard:internal"])

licenses(["notice"])

tf_ts_library(
    name = "actions",
    srcs = [
        "index.ts",
        "profile_actions.ts",
    ],
    deps = [
        "//tensorboard/webapp/profile:types",
        "@npm//@ngrx/store",
    ],
)

tf_ts_library(
    name = "index",
    srcs = [
        "index.ts",
    ],
    deps = [
        ":actions",
    ],
)

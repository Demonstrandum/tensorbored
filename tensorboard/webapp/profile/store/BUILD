load("//tensorboard/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorboard:internal"])

licenses(["notice"])

tf_ts_library(
    name = "store",
    srcs = [
        "index.ts",
        "profile_reducers.ts",
        "profile_selectors.ts",
        "profile_types.ts",
    ],
    deps = [
        "//tensorboard/webapp/profile:types",
        "//tensorboard/webapp/profile/actions",
        "//tensorboard/webapp/types",
        "@npm//@ngrx/store",
    ],
)

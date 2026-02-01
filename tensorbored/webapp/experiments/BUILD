load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ng_module(
    name = "experiments",
    srcs = [
        "experiments_module.ts",
    ],
    deps = [
        "//tensorbored/webapp/experiments/store",
        "//tensorbored/webapp/experiments/store:types",
        "@npm//@angular/core",
        "@npm//@ngrx/store",
    ],
)

tf_ts_library(
    name = "types",
    srcs = [
        "types.ts",
    ],
)

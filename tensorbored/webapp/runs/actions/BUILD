load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ts_library(
    name = "actions",
    srcs = [
        "index.ts",
        "runs_actions.ts",
    ],
    deps = [
        "//tensorbored/webapp/runs:types",
        "//tensorbored/webapp/runs/data_source",
        "//tensorbored/webapp/types:ui",
        "//tensorbored/webapp/widgets/data_table:types",
        "@npm//@ngrx/store",
    ],
)

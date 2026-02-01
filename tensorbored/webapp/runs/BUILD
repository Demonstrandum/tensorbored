load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ng_module(
    name = "runs",
    srcs = [
        "runs_module.ts",
    ],
    deps = [
        "//tensorbored/webapp/alert:alert_action",
        "//tensorbored/webapp/hparams",
        "//tensorbored/webapp/runs/actions",
        "//tensorbored/webapp/runs/data_source",
        "//tensorbored/webapp/runs/effects",
        "//tensorbored/webapp/runs/store",
        "//tensorbored/webapp/runs/store:types",
        "@npm//@angular/core",
        "@npm//@ngrx/effects",
        "@npm//@ngrx/store",
    ],
)

tf_ts_library(
    name = "types",
    srcs = [
        "types.ts",
    ],
    deps = ["//tensorbored/webapp/runs/data_source"],
)

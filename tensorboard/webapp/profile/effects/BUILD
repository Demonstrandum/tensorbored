load("//tensorboard/defs:defs.bzl", "tf_ng_module")

package(default_visibility = ["//tensorboard:internal"])

licenses(["notice"])

tf_ng_module(
    name = "effects",
    srcs = [
        "index.ts",
        "profile_effects.ts",
    ],
    deps = [
        "//tensorboard/webapp:app_state",
        "//tensorboard/webapp/app_routing:actions",
        "//tensorboard/webapp/metrics:types",
        "//tensorboard/webapp/metrics/actions",
        "//tensorboard/webapp/metrics/data_source:types",
        "//tensorboard/webapp/metrics/store:metrics_selectors",
        "//tensorboard/webapp/profile:types",
        "//tensorboard/webapp/profile/actions",
        "//tensorboard/webapp/profile/data_source",
        "//tensorboard/webapp/runs:types",
        "//tensorboard/webapp/runs/actions",
        "//tensorboard/webapp/runs/store:selectors",
        "@npm//@angular/core",
        "@npm//@ngrx/effects",
        "@npm//@ngrx/store",
        "@npm//rxjs",
    ],
)

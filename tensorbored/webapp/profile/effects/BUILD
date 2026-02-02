load("//tensorbored/defs:defs.bzl", "tf_ng_module")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ng_module(
    name = "effects",
    srcs = [
        "index.ts",
        "profile_effects.ts",
    ],
    deps = [
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp:selectors",
        "//tensorbored/webapp/app_routing/actions",
        "//tensorbored/webapp/metrics:types",
        "//tensorbored/webapp/metrics/actions",
        "//tensorbored/webapp/metrics/data_source:types",
        "//tensorbored/webapp/metrics/store",
        "//tensorbored/webapp/profile:types",
        "//tensorbored/webapp/profile/actions",
        "//tensorbored/webapp/profile/data_source",
        "//tensorbored/webapp/profile/store",
        "//tensorbored/webapp/runs:types",
        "//tensorbored/webapp/runs/actions",
        "//tensorbored/webapp/runs/store:selectors",
        "//tensorbored/webapp/types",
        "@npm//@angular/core",
        "@npm//@ngrx/effects",
        "@npm//@ngrx/store",
        "@npm//rxjs",
    ],
)

load("//tensorbored/defs:defs.bzl", "tf_ng_module")

package(default_visibility = ["//tensorbored:internal"])

tf_ng_module(
    name = "effects",
    srcs = [
        "index.ts",
    ],
    deps = [
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp/alert:alert_action",
        "//tensorbored/webapp/alert/actions",
        "@npm//@angular/core",
        "@npm//@ngrx/effects",
        "@npm//@ngrx/store",
        "@npm//rxjs",
    ],
)

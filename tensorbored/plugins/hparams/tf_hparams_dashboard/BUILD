load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ts_library(
    name = "tf_hparams_dashboard",
    srcs = [
        "tf-hparams-dashboard.ts",
    ],
    strict_checks = False,
    deps = [
        "//tensorbored/components/polymer:legacy_element_mixin",
        "//tensorbored/components/tf_backend",
        "//tensorbored/plugins/hparams/tf_hparams_backend",
        "//tensorbored/plugins/hparams/tf_hparams_main",
        "@npm//@polymer/decorators",
        "@npm//@polymer/polymer",
    ],
)

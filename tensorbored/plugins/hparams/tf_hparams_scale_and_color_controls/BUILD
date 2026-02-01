load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility =
            ["//tensorbored/plugins/hparams:__subpackages__"])

licenses(["notice"])

tf_ts_library(
    name = "tf_hparams_scale_and_color_controls",
    srcs = [
        "tf-hparams-scale-and-color-controls.ts",
    ],
    strict_checks = False,
    deps = [
        "//tensorbored/components/polymer:dom",
        "//tensorbored/components/polymer:irons_and_papers",
        "//tensorbored/plugins/hparams/tf_hparams_utils",
        "@npm//@polymer/decorators",
        "@npm//@polymer/polymer",
        "@npm//@types/d3",
        "@npm//d3",
    ],
)

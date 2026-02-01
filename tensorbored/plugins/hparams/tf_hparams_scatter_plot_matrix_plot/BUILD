load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility =
            ["//tensorbored/plugins/hparams:__subpackages__"])

licenses(["notice"])

tf_ts_library(
    name = "tf_hparams_scatter_plot_matrix_plot",
    srcs = [
        "tf-hparams-scatter-plot-matrix-plot.ts",
    ],
    strict_checks = False,
    deps = [
        "//tensorbored/components/polymer:legacy_element_mixin",
        "//tensorbored/plugins/hparams/tf_hparams_utils",
        "@npm//@polymer/decorators",
        "@npm//@polymer/polymer",
        "@npm//@types/d3",
        "@npm//@types/lodash",
        "@npm//d3",
        "@npm//lodash",
    ],
)

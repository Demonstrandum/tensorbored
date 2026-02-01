load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorbored/plugins/hparams:__subpackages__"])

licenses(["notice"])

tf_ts_library(
    name = "tf_hparams_parallel_coords_plot",
    srcs = [
        "axes.ts",
        "interaction_manager.ts",
        "lines.ts",
        "tf-hparams-parallel-coords-plot.ts",
        "utils.ts",
    ],
    strict_checks = False,
    deps = [
        "//tensorbored/components/polymer:dark_mode_mixin",
        "//tensorbored/components/polymer:legacy_element_mixin",
        "//tensorbored/plugins/hparams:types",
        "//tensorbored/plugins/hparams/tf_hparams_session_group_values",
        "//tensorbored/plugins/hparams/tf_hparams_types",
        "//tensorbored/plugins/hparams/tf_hparams_utils",
        "@npm//@polymer/decorators",
        "@npm//@polymer/polymer",
        "@npm//@types/d3",
        "@npm//@types/lodash",
        "@npm//d3",
        "@npm//lodash",
        "@npm//plottable",
    ],
)

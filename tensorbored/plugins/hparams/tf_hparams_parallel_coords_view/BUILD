load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility =
            ["//tensorbored/plugins/hparams:__subpackages__"])

licenses(["notice"])

tf_ts_library(
    name = "tf_hparams_parallel_coords_view",
    srcs = [
        "tf-hparams-parallel-coords-view.ts",
    ],
    strict_checks = False,
    deps = [
        "//tensorbored/plugins/hparams/tf_hparams_parallel_coords_plot",
        "//tensorbored/plugins/hparams/tf_hparams_scale_and_color_controls",
        "//tensorbored/plugins/hparams/tf_hparams_session_group_details",
        "//tensorbored/plugins/hparams/tf_hparams_session_group_values",
        "//tensorbored/plugins/hparams/tf_hparams_utils:hparams_split_layout",
        "@npm//@polymer/decorators",
        "@npm//@polymer/polymer",
    ],
)

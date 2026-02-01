load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility =
            ["//tensorbored/plugins/hparams:__subpackages__"])

licenses(["notice"])

tf_ts_library(
    name = "tf_hparams_sessions_pane",
    srcs = [
        "tf-hparams-sessions-pane.ts",
    ],
    strict_checks = False,
    deps = [
        "//tensorbored/components/polymer:irons_and_papers",
        "//tensorbored/plugins/hparams/tf_hparams_parallel_coords_view",
        "//tensorbored/plugins/hparams/tf_hparams_scatter_plot_matrix_view",
        "//tensorbored/plugins/hparams/tf_hparams_table_view",
        "@npm//@polymer/decorators",
        "@npm//@polymer/iron-pages",
        "@npm//@polymer/paper-button",
        "@npm//@polymer/paper-header-panel",
        "@npm//@polymer/paper-icon-button",
        "@npm//@polymer/paper-tabs",
        "@npm//@polymer/paper-toolbar",
        "@npm//@polymer/polymer",
    ],
)

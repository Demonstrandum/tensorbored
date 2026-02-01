load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility =
            ["//tensorbored/plugins/hparams:__subpackages__"])

licenses(["notice"])

tf_ts_library(
    name = "tf_hparams_table_view",
    srcs = [
        "tf-hparams-table-view.ts",
    ],
    strict_checks = False,
    deps = [
        "//tensorbored/components/polymer:dark_mode_mixin",
        "//tensorbored/components/polymer:dom",
        "//tensorbored/components/polymer:legacy_element_mixin",
        "//tensorbored/plugins/hparams/tf_hparams_session_group_details",
        "//tensorbored/plugins/hparams/tf_hparams_utils",
        "@npm//@polymer/decorators",
        "@npm//@polymer/polymer",
        "@npm//@vaadin/vaadin-grid",
    ],
)

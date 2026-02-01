load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility =
            ["//tensorbored/plugins/hparams:__subpackages__"])

licenses(["notice"])

tf_ts_library(
    name = "tf_hparams_session_group_details",
    srcs = [
        "tf-hparams-session-group-details.ts",
    ],
    strict_checks = False,
    deps = [
        "//tensorbored/components/polymer:irons_and_papers",
        "//tensorbored/components/polymer:legacy_class",
        "//tensorbored/components/tf_backend",
        "//tensorbored/components/tf_color_scale",
        "//tensorbored/components/tf_dashboard_common",
        "//tensorbored/components/vz_chart_helpers",
        "//tensorbored/plugins/hparams/tf_hparams_utils",
        "//tensorbored/plugins/scalar/tf_scalar_dashboard:tf_scalar_card",
        "@npm//@polymer/decorators",
        "@npm//@polymer/iron-flex-layout",
        "@npm//@polymer/iron-resizable-behavior",
        "@npm//@polymer/polymer",
    ],
)

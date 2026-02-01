load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility =
            ["//tensorbored/plugins/hparams:__subpackages__"])

licenses(["notice"])

tf_ts_library(
    name = "tf_hparams_session_group_values",
    srcs = [
        "tf-hparams-session-group-values.ts",
    ],
    strict_checks = False,
    deps = [
        "//tensorbored/plugins/hparams/tf_hparams_table_view",
        "//tensorbored/plugins/hparams/tf_hparams_utils",
        "@npm//@polymer/decorators",
        "@npm//@polymer/polymer",
    ],
)

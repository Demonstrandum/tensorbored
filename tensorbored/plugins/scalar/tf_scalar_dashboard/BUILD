load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ts_library(
    name = "tf_scalar_dashboard",
    srcs = ["tf-scalar-dashboard.ts"],
    strict_checks = False,
    deps = [
        ":tf_scalar_card",
        ":tf_smoothing_input",
        "//tensorbored/components/polymer:irons_and_papers",
        "//tensorbored/components/polymer:legacy_element_mixin",
        "//tensorbored/components/tf_backend",
        "//tensorbored/components/tf_categorization_utils",
        "//tensorbored/components/tf_color_scale",
        "//tensorbored/components/tf_dashboard_common",
        "//tensorbored/components/tf_globals",
        "//tensorbored/components/tf_paginated_view",
        "//tensorbored/components/tf_runs_selector",
        "//tensorbored/components/tf_storage",
        "//tensorbored/components/tf_utils",
        "//tensorbored/components/vz_chart_helpers",
        "//tensorbored/webapp/feature_flag:types",
        "@npm//@polymer/decorators",
        "@npm//@polymer/polymer",
        "@npm//@types/lodash",
        "@npm//lodash",
    ],
)

tf_ts_library(
    name = "tf_smoothing_input",
    srcs = ["tf-smoothing-input.ts"],
    strict_checks = False,
    deps = [
        "//tensorbored/components/polymer:irons_and_papers",
        "@npm//@polymer/decorators",
        "@npm//@polymer/polymer",
        "@npm//@types/lodash",
        "@npm//lodash",
    ],
)

tf_ts_library(
    name = "tf_scalar_card",
    srcs = ["tf-scalar-card.ts"],
    strict_checks = False,
    deps = [
        "//tensorbored/components/polymer:irons_and_papers",
        "//tensorbored/components/tf_backend",
        "//tensorbored/components/tf_card_heading",
        "//tensorbored/components/tf_color_scale",
        "//tensorbored/components/tf_dashboard_common",
        "//tensorbored/components/tf_line_chart_data_loader",
        "//tensorbored/components/vz_chart_helpers",
        "//tensorbored/components/vz_line_chart2",
        "@npm//@polymer/decorators",
        "@npm//@polymer/polymer",
    ],
)

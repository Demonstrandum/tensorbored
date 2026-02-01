load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ts_library(
    name = "tf_custom_scalar_dashboard",
    srcs = [
        "tf-custom-scalar-card-style.ts",
        "tf-custom-scalar-dashboard.ts",
        "tf-custom-scalar-helpers.ts",
        "tf-custom-scalar-margin-chart-card.ts",
        "tf-custom-scalar-multi-line-chart-card.ts",
    ],
    strict_checks = False,
    deps = [
        "//tensorbored/components/polymer:dom-repeat",
        "//tensorbored/components/polymer:irons_and_papers",
        "//tensorbored/components/polymer:legacy_element_mixin",
        "//tensorbored/components/polymer:register_style_dom_module",
        "//tensorbored/components/tf_backend",
        "//tensorbored/components/tf_card_heading",
        "//tensorbored/components/tf_categorization_utils",
        "//tensorbored/components/tf_color_scale",
        "//tensorbored/components/tf_dashboard_common",
        "//tensorbored/components/tf_line_chart_data_loader",
        "//tensorbored/components/tf_paginated_view",
        "//tensorbored/components/tf_runs_selector",
        "//tensorbored/components/tf_storage",
        "//tensorbored/components/tf_utils",
        "//tensorbored/components/vz_chart_helpers",
        "//tensorbored/plugins/scalar/tf_scalar_dashboard:tf_smoothing_input",
        "@npm//@polymer/decorators",
        "@npm//@polymer/polymer",
        "@npm//@types/lodash",
        "@npm//lodash",
        "@npm//plottable",
    ],
)

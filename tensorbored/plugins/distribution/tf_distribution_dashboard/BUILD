load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ts_library(
    name = "tf_distribution_dashboard",
    srcs = [
        "tf-distribution-dashboard.ts",
        "tf-distribution-loader.ts",
    ],
    strict_checks = False,
    deps = [
        "//tensorbored/components/polymer:irons_and_papers",
        "//tensorbored/components/polymer:legacy_element_mixin",
        "//tensorbored/components/tf_backend",
        "//tensorbored/components/tf_card_heading",
        "//tensorbored/components/tf_categorization_utils",
        "//tensorbored/components/tf_color_scale",
        "//tensorbored/components/tf_dashboard_common",
        "//tensorbored/components/tf_paginated_view",
        "//tensorbored/components/tf_runs_selector",
        "//tensorbored/plugins/distribution/vz_distribution_chart",
        "@npm//@polymer/decorators",
        "@npm//@polymer/polymer",
        "@npm//@types/lodash",
        "@npm//lodash",
    ],
)

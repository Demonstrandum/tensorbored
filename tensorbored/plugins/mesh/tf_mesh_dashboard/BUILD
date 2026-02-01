load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ts_library(
    name = "tf_mesh_dashboard",
    srcs = [
        "array-buffer-data-provider.ts",
        "mesh-loader.ts",
        "mesh-viewer.ts",
        "tf-mesh-dashboard.ts",
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
        "@npm//@polymer/decorators",
        "@npm//@polymer/polymer",
        "@npm//@types/d3",
        "@npm//@types/lodash",
        "@npm//@types/three",
        "@npm//d3",
        "@npm//lodash",
        "@npm//three",
    ],
)

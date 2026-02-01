load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ts_library(
    name = "tf_paginated_view",
    srcs = [
        "index.ts",
        "paginatedViewStore.ts",
        "tf-category-paginated-view.ts",
        "tf-dom-repeat.ts",
        "tf-paginated-view-store.ts",
    ],
    strict_checks = False,
    deps = [
        "//tensorbored/components/polymer:irons_and_papers",
        "//tensorbored/components/polymer:legacy_element_mixin",
        "//tensorbored/components/polymer:register_style_dom_module",
        "//tensorbored/components/tf_categorization_utils",
        "//tensorbored/components/tf_dashboard_common",
        "//tensorbored/components/tf_storage",
        "@npm//@polymer/decorators",
        "@npm//@polymer/polymer",
    ],
)

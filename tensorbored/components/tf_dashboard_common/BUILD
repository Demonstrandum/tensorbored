load("//tensorbored/defs:defs.bzl", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ts_library(
    name = "tf_dashboard_common",
    srcs = [
        "array-update-helper.ts",
        "dashboard-style.ts",
        "data-loader-behavior.ts",
        "run-color-style.ts",
        "scrollbar-style.ts",
        "tensorboard-color.ts",
        "tf-dashboard-layout.ts",
        "tf-downloader.ts",
        "tf-dropdown-trigger.ts",
        "tf-filterable-checkbox-dropdown.ts",
        "tf-filterable-checkbox-list.ts",
        "tf-multi-checkbox.ts",
        "tf-no-data-warning.ts",
        "tf-option-selector.ts",
    ],
    strict_checks = False,
    deps = [
        "//tensorbored/components/polymer:dark_mode_mixin",
        "//tensorbored/components/polymer:irons_and_papers",
        "//tensorbored/components/polymer:legacy_element_mixin",
        "//tensorbored/components/polymer:paper_inky_focus_behavior",
        "//tensorbored/components/polymer:register_style_dom_module",
        "//tensorbored/components/polymer:utils_mixin",
        "//tensorbored/components/tf_backend",
        "//tensorbored/components/tf_color_scale",
        "//tensorbored/components/tf_storage",
        "//tensorbored/components/vz_sorting",
        "@npm//@polymer/decorators",
        "@npm//@polymer/polymer",
        "@npm//@types/d3",
        "@npm//@types/lodash",
        "@npm//d3",
        "@npm//lodash",
    ],
)

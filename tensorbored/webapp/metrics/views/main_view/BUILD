load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_sass_binary", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

tf_sass_binary(
    name = "main_view_styles",
    src = "main_view_component.scss",
    deps = [
        "//tensorbored/webapp:angular_material_sass_deps",
        "//tensorbored/webapp/metrics/views:metrics_common_styles",
        "//tensorbored/webapp/theme",
    ],
)

tf_sass_binary(
    name = "filter_input_component_styles",
    src = "filter_input_component.scss",
    deps = [
        "//tensorbored/webapp:angular_material_sass_deps",
        "//tensorbored/webapp/theme",
    ],
)

tf_sass_binary(
    name = "filtered_view_component_styles",
    src = "filtered_view_component.scss",
    deps = [
        "//tensorbored/webapp/metrics/views:metrics_common_styles",
        "//tensorbored/webapp/theme",
    ],
)

tf_sass_binary(
    name = "pinned_view_component_styles",
    src = "pinned_view_component.scss",
    deps = [
        "//tensorbored/webapp:angular_material_sass_deps",
        "//tensorbored/webapp/metrics/views:metrics_common_styles",
        "//tensorbored/webapp/theme",
    ],
)

tf_sass_binary(
    name = "card_grid_component_styles",
    src = "card_grid_component.scss",
    deps = [
        "//tensorbored/webapp/metrics/views:metrics_common_styles",
        "//tensorbored/webapp/theme",
    ],
)

tf_sass_binary(
    name = "card_groups_component_styles",
    src = "card_groups_component.scss",
    deps = [
        "//tensorbored/webapp/metrics/views:metrics_common_styles",
        "//tensorbored/webapp/theme",
    ],
)

tf_sass_binary(
    name = "card_group_toolbar_component_styles",
    src = "card_group_toolbar_component.scss",
    deps = [
        "//tensorbored/webapp/metrics/views:metrics_common_styles",
        "//tensorbored/webapp/theme",
    ],
)

tf_sass_binary(
    name = "superimposed_cards_view_component_styles",
    src = "superimposed_cards_view_component.scss",
    deps = [
        "//tensorbored/webapp/metrics/views:metrics_common_styles",
        "//tensorbored/webapp/theme",
    ],
)

tf_ts_library(
    name = "common_selectors",
    srcs = ["common_selectors.ts"],
    deps = [
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp:selectors",
        "//tensorbored/webapp/app_routing:types",
        "//tensorbored/webapp/hparams:types",
        "//tensorbored/webapp/hparams/_redux:hparams_selectors",
        "//tensorbored/webapp/metrics:utils",
        "//tensorbored/webapp/metrics/data_source",
        "//tensorbored/webapp/metrics/store",
        "//tensorbored/webapp/metrics/views:types",
        "//tensorbored/webapp/metrics/views:utils",
        "//tensorbored/webapp/metrics/views/card_renderer:scalar_card_types",
        "//tensorbored/webapp/runs:types",
        "//tensorbored/webapp/runs/store:selectors",
        "//tensorbored/webapp/runs/views/runs_table:types",
        "//tensorbored/webapp/util:matcher",
        "//tensorbored/webapp/util:memoize",
        "//tensorbored/webapp/util:types",
        "@npm//@ngrx/store",
    ],
)

tf_ng_module(
    name = "main_view",
    srcs = [
        "card_grid_component.ts",
        "card_grid_container.ts",
        "card_group_toolbar_component.ts",
        "card_group_toolbar_container.ts",
        "card_groups_component.ts",
        "card_groups_container.ts",
        "empty_tag_match_message_component.ts",
        "empty_tag_match_message_container.ts",
        "filter_input_component.ts",
        "filter_input_container.ts",
        "filtered_view_component.ts",
        "filtered_view_container.ts",
        "main_view_component.ts",
        "main_view_container.ts",
        "main_view_module.ts",
        "pinned_view_component.ts",
        "pinned_view_container.ts",
        "superimposed_cards_view_component.ts",
        "superimposed_cards_view_container.ts",
    ],
    assets = [
        "card_grid_component.ng.html",
        "filter_input_component.ng.html",
        "main_view_component.ng.html",
        ":card_grid_component_styles",
        ":card_group_toolbar_component_styles",
        ":card_groups_component_styles",
        ":filter_input_component_styles",
        ":filtered_view_component_styles",
        ":main_view_styles",
        ":pinned_view_component_styles",
        ":superimposed_cards_view_component_styles",
    ],
    deps = [
        ":common_selectors",
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp:selectors",
        "//tensorbored/webapp/angular:expect_angular_cdk_scrolling",
        "//tensorbored/webapp/angular:expect_angular_material_autocomplete",
        "//tensorbored/webapp/angular:expect_angular_material_button",
        "//tensorbored/webapp/angular:expect_angular_material_button_toggle",
        "//tensorbored/webapp/angular:expect_angular_material_icon",
        "//tensorbored/webapp/angular:expect_angular_material_input",
        "//tensorbored/webapp/angular:expect_angular_material_progress_spinner",
        "//tensorbored/webapp/customization",
        "//tensorbored/webapp/metrics:types",
        "//tensorbored/webapp/metrics:utils",
        "//tensorbored/webapp/metrics/actions",
        "//tensorbored/webapp/metrics/data_source",
        "//tensorbored/webapp/metrics/store",
        "//tensorbored/webapp/metrics/store:types",
        "//tensorbored/webapp/metrics/views:types",
        "//tensorbored/webapp/metrics/views:utils",
        "//tensorbored/webapp/metrics/views/card_renderer",
        "//tensorbored/webapp/metrics/views/right_pane",
        "//tensorbored/webapp/metrics/views/right_pane/scalar_column_editor",
        "//tensorbored/webapp/settings",
        "//tensorbored/webapp/types",
        "//tensorbored/webapp/types:ui",
        "//tensorbored/webapp/util:string",
        "//tensorbored/webapp/util:types",
        "//tensorbored/webapp/widgets/filter_input",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@ngrx/store",
        "@npm//rxjs",
    ],
)

tf_ts_library(
    name = "main_view_tests",
    testonly = True,
    srcs = [
        "card_grid_test.ts",
        "common_selectors_test.ts",
        "filter_input_test.ts",
        "main_view_test.ts",
    ],
    deps = [
        ":common_selectors",
        ":main_view",
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp:selectors",
        "//tensorbored/webapp/angular:expect_angular_cdk_overlay",
        "//tensorbored/webapp/angular:expect_angular_cdk_scrolling",
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "//tensorbored/webapp/angular:expect_angular_material_autocomplete",
        "//tensorbored/webapp/angular:expect_angular_material_button",
        "//tensorbored/webapp/angular:expect_angular_platform_browser_animations",
        "//tensorbored/webapp/angular:expect_ngrx_store_testing",
        "//tensorbored/webapp/app_routing",
        "//tensorbored/webapp/app_routing:testing",
        "//tensorbored/webapp/app_routing/store:testing",
        "//tensorbored/webapp/customization",
        "//tensorbored/webapp/experiments/store:testing",
        "//tensorbored/webapp/hparams:types",
        "//tensorbored/webapp/hparams/_redux:testing",
        "//tensorbored/webapp/metrics:test_lib",
        "//tensorbored/webapp/metrics:types",
        "//tensorbored/webapp/metrics/actions",
        "//tensorbored/webapp/metrics/data_source",
        "//tensorbored/webapp/metrics/store",
        "//tensorbored/webapp/metrics/views:types",
        "//tensorbored/webapp/metrics/views/card_renderer",
        "//tensorbored/webapp/metrics/views/card_renderer:scalar_card_types",
        "//tensorbored/webapp/runs/store:selectors",
        "//tensorbored/webapp/runs/store:testing",
        "//tensorbored/webapp/runs/store:types",
        "//tensorbored/webapp/runs/views/runs_table:types",
        "//tensorbored/webapp/settings",
        "//tensorbored/webapp/testing:dom",
        "//tensorbored/webapp/testing:mat_icon",
        "//tensorbored/webapp/testing:material",
        "//tensorbored/webapp/testing:utils",
        "//tensorbored/webapp/types",
        "//tensorbored/webapp/types:ui",
        "//tensorbored/webapp/widgets/filter_input",
        "@npm//@angular/core",
        "@npm//@angular/platform-browser",
        "@npm//@ngrx/store",
        "@npm//@types/jasmine",
        "@npm//rxjs",
    ],
)

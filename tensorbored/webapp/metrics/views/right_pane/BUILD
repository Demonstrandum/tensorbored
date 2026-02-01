load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_sass_binary", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

tf_sass_binary(
    name = "settings_view_styles",
    src = "settings_view_component.scss",
    deps = [
        "//tensorbored/webapp:angular_material_sass_deps",
        "//tensorbored/webapp/theme",
    ],
)

tf_sass_binary(
    name = "saving_pins_checkbox_styles",
    src = "saving_pins_checkbox_component.scss",
    deps = [
        "//tensorbored/webapp:angular_material_sass_deps",
        "//tensorbored/webapp/theme",
    ],
)

tf_ng_module(
    name = "right_pane",
    srcs = [
        "right_pane_component.ts",
        "right_pane_module.ts",
        "saving_pins_checkbox_component.ts",
        "settings_view_component.ts",
        "settings_view_container.ts",
    ],
    assets = [
        ":settings_view_styles",
        "settings_view_component.ng.html",
        ":saving_pins_checkbox_styles",
    ],
    deps = [
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp:selectors",
        "//tensorbored/webapp/angular:expect_angular_material_button",
        "//tensorbored/webapp/angular:expect_angular_material_button_toggle",
        "//tensorbored/webapp/angular:expect_angular_material_checkbox",
        "//tensorbored/webapp/angular:expect_angular_material_dialog",
        "//tensorbored/webapp/angular:expect_angular_material_icon",
        "//tensorbored/webapp/angular:expect_angular_material_select",
        "//tensorbored/webapp/angular:expect_angular_material_slider",
        "//tensorbored/webapp/feature_flag",
        "//tensorbored/webapp/metrics:types",
        "//tensorbored/webapp/metrics/actions",
        "//tensorbored/webapp/metrics/views/right_pane/saving_pins_dialog",
        "//tensorbored/webapp/widgets/card_fob:types",
        "//tensorbored/webapp/widgets/dropdown",
        "//tensorbored/webapp/widgets/range_input",
        "//tensorbored/webapp/widgets/range_input:types",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@ngrx/store",
        "@npm//rxjs",
    ],
)

tf_ts_library(
    name = "right_pane_test",
    testonly = True,
    srcs = [
        "right_pane_test.ts",
    ],
    deps = [
        ":right_pane",
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp:selectors",
        "//tensorbored/webapp/angular:expect_angular_cdk_overlay",
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "//tensorbored/webapp/angular:expect_angular_material_button_toggle",
        "//tensorbored/webapp/angular:expect_angular_material_checkbox",
        "//tensorbored/webapp/angular:expect_angular_material_select",
        "//tensorbored/webapp/angular:expect_angular_material_slider",
        "//tensorbored/webapp/angular:expect_angular_platform_browser_animations",
        "//tensorbored/webapp/angular:expect_ngrx_store_testing",
        "//tensorbored/webapp/metrics:types",
        "//tensorbored/webapp/metrics/actions",
        "//tensorbored/webapp/metrics/store",
        "//tensorbored/webapp/metrics/views/right_pane/saving_pins_dialog",
        "//tensorbored/webapp/testing:utils",
        "//tensorbored/webapp/widgets/card_fob:types",
        "//tensorbored/webapp/widgets/dropdown",
        "//tensorbored/webapp/widgets/range_input:types",
        "@npm//@angular/core",
        "@npm//@angular/platform-browser",
        "@npm//@ngrx/store",
        "@npm//@types/jasmine",
    ],
)

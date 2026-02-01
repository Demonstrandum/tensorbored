load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_sass_binary", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

tf_sass_binary(
    name = "scalar_column_editor_styles",
    src = "scalar_column_editor_component.scss",
    deps = [
        "//tensorbored/webapp:angular_material_sass_deps",
        "//tensorbored/webapp/theme",
    ],
)

tf_ng_module(
    name = "scalar_column_editor",
    srcs = [
        "scalar_column_editor_component.ts",
        "scalar_column_editor_container.ts",
        "scalar_column_editor_module.ts",
    ],
    assets = [
        ":scalar_column_editor_styles",
        "scalar_column_editor_component.ng.html",
    ],
    deps = [
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp:selectors",
        "//tensorbored/webapp/angular:expect_angular_material_checkbox",
        "//tensorbored/webapp/angular:expect_angular_material_icon",
        "//tensorbored/webapp/angular:expect_angular_material_tabs",
        "//tensorbored/webapp/metrics:types",
        "//tensorbored/webapp/metrics/actions",
        "//tensorbored/webapp/metrics/store",
        "//tensorbored/webapp/metrics/views/main_view:common_selectors",
        "//tensorbored/webapp/widgets/data_table:data_table_header",
        "//tensorbored/webapp/widgets/data_table:types",
        "@npm//@angular/common",
        "@npm//@angular/core",
        "@npm//@ngrx/store",
        "@npm//rxjs",
    ],
)

tf_ts_library(
    name = "scalar_column_editor_test",
    testonly = True,
    srcs = [
        "scalar_column_editor_test.ts",
    ],
    deps = [
        ":scalar_column_editor",
        "//tensorbored/webapp:app_state",
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "//tensorbored/webapp/angular:expect_angular_material_checkbox",
        "//tensorbored/webapp/angular:expect_angular_material_tabs",
        "//tensorbored/webapp/angular:expect_angular_platform_browser_animations",
        "//tensorbored/webapp/angular:expect_ngrx_store_testing",
        "//tensorbored/webapp/metrics/actions",
        "//tensorbored/webapp/metrics/store",
        "//tensorbored/webapp/widgets/data_table:data_table_header",
        "//tensorbored/webapp/widgets/data_table:types",
        "@npm//@angular/core",
        "@npm//@angular/platform-browser",
        "@npm//@ngrx/store",
        "@npm//@types/jasmine",
    ],
)

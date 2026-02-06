load("//tensorbored/defs:defs.bzl", "tf_external_sass_libray", "tf_ng_module", "tf_ng_prod_js_binary", "tf_ng_web_test_suite", "tf_sass_binary", "tf_svg_bundle", "tf_ts_library")
load("//tensorbored/defs:js.bzl", "tf_resource_digest_suffixer")
load("//tensorbored/defs:web.bzl", "tb_combine_html", "tf_web_library")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

tf_ng_module(
    name = "oss_plugins_module",
    srcs = [
        "oss_plugins_module.ts",
    ],
    deps = [
        "//tensorbored/plugins/debugger_v2/tf_debugger_v2_plugin:debugger_v2",
        "//tensorbored/webapp/metrics",
        "@npm//@angular/core",
    ],
)

tf_ng_module(
    name = "reducer_config",
    srcs = [
        "reducer_config.ts",
    ],
    deps = [
        "@npm//@angular/core",
        "@npm//@ngrx/store",
    ],
)

tf_ng_module(
    name = "store_module",
    srcs = [
        "store_module.ts",
    ],
    deps = [
        ":reducer_config",
        "@npm//@angular/core",
        "@npm//@ngrx/effects",
        "@npm//@ngrx/store",
    ],
)

tf_ng_module(
    name = "selectors",
    srcs = [
        "selectors.ts",
    ],
    deps = [
        "//tensorbored/webapp/alert/store",
        "//tensorbored/webapp/app_routing/store",
        "//tensorbored/webapp/core/store",
        "//tensorbored/webapp/experiments/store:selectors",
        "//tensorbored/webapp/feature_flag/store",
        "//tensorbored/webapp/metrics/store",
        "//tensorbored/webapp/notification_center/_redux",
        "//tensorbored/webapp/persistent_settings/_redux",
        "//tensorbored/webapp/profile/store",
        "//tensorbored/webapp/runs/store:selectors",
        "//tensorbored/webapp/util:ui_selectors",
    ],
)

tf_ng_module(
    name = "mat_icon",
    srcs = [
        "mat_icon_module.ts",
    ],
    deps = [
        "//tensorbored/webapp/angular:expect_angular_material_icon",
        "@npm//@angular/core",
        "@npm//@angular/platform-browser",
    ],
)

tf_ts_library(
    name = "tb_polymer_interop_types",
    srcs = [
        "tb_polymer_interop_type_definitions.d.ts",
        "tb_polymer_interop_types.ts",
    ],
    deps = [
        # This build target is shared with the polymer binary, do not
        # add any more dependencies.
        "//tensorbored/webapp/feature_flag:types",
    ],
)

tf_sass_binary(
    name = "app_styles",
    src = "app_container.scss",
    deps = ["//tensorbored/webapp/theme"],
)

# Angular module for the top-level app component together with all of its
# injectable dependencies.  I.e., the entire Angular app.
tf_ng_module(
    name = "app",
    srcs = [
        "app_container.ts",
        "app_module.ts",
    ],
    assets = [
        ":app_styles",
        "app_container.ng.html",
    ],
    deps = [
        ":app_state",
        ":mat_icon",
        ":oss_plugins_module",
        ":selectors",
        ":store_module",
        ":tb_polymer_interop_types",
        "//tensorbored/components/experimental/plugin_util:plugin_host",
        "//tensorbored/webapp/alert",
        "//tensorbored/webapp/alert/views:alert_snackbar",
        "//tensorbored/webapp/angular:expect_angular_platform_browser_animations",
        "//tensorbored/webapp/app_routing",
        "//tensorbored/webapp/app_routing:route_registry",
        "//tensorbored/webapp/app_routing/views",
        "//tensorbored/webapp/core",
        "//tensorbored/webapp/core/views:dark_mode_supporter",
        "//tensorbored/webapp/core/views:hash_storage",
        "//tensorbored/webapp/core/views:page_title",
        "//tensorbored/webapp/experiments",
        "//tensorbored/webapp/feature_flag",
        "//tensorbored/webapp/feature_flag/views:feature_flag_modal_trigger",
        "//tensorbored/webapp/header",
        "//tensorbored/webapp/hparams",
        "//tensorbored/webapp/persistent_settings",
        "//tensorbored/webapp/plugins",
        "//tensorbored/webapp/profile",
        "//tensorbored/webapp/reloader",
        "//tensorbored/webapp/routes",
        "//tensorbored/webapp/runs",
        "//tensorbored/webapp/runs_legacy",
        "//tensorbored/webapp/settings",
        "//tensorbored/webapp/tb_wrapper",
        "@npm//@angular/core",
        "@npm//@angular/platform-browser",
    ],
)

tf_ng_module(
    name = "app_state",
    srcs = [
        "app_state.ts",
    ],
    deps = [
        "//tensorbored/webapp/alert/store:types",
        "//tensorbored/webapp/app_routing/store:types",
        "//tensorbored/webapp/core/store",
        "//tensorbored/webapp/experiments/store:types",
        "//tensorbored/webapp/feature_flag/store:types",
        "//tensorbored/webapp/hparams:types",
        "//tensorbored/webapp/metrics/store:types",
        "//tensorbored/webapp/notification_center/_redux:types",
        "//tensorbored/webapp/persistent_settings/_redux:types",
        "//tensorbored/webapp/profile/store",
        "//tensorbored/webapp/runs/store:types",
        "//tensorbored/webapp/settings",
    ],
)

tf_ng_module(
    name = "ng_main",
    srcs = [
        "bootstrap.ts",
        "main_prod.ts",
    ],
    deps = [
        ":app",
        "@npm//@angular/core",
        "@npm//@angular/localize",
        "@npm//@angular/platform-browser",
        "@npm//@angular/router",
        "@npm//zone.js",
    ],
)

# Compile the prepared Angular app to a JS binary.
tf_ng_prod_js_binary(
    name = "tb_webapp_binary",
    compile = 1,
    entry_point = "main_prod.ts",
    deps = [
        ":ng_main",
    ],
)

# Wrap the Angular app JS binary as a library.
tf_web_library(
    name = "tb_webapp",
    srcs = [
        ":tb_webapp_binary.js",
    ],
    path = "/tb-webapp",
    deps = [
        ":tb_webapp_binary",
    ],
)

genrule(
    name = "gen_index_polymer3.html",
    srcs = ["index_polymer3.uninlined.html"],
    outs = ["index_polymer3.inlined.html"],
    cmd = "$(execpath //tensorbored/logo:inline_favicon) $< >$@",
    tools = ["//tensorbored/logo:inline_favicon"],
)

# Bundle the Angular app with the Polymer components and plugins, as a library.
tf_web_library(
    name = "tensorboard-webapp",
    srcs = [
        "index_polymer3.inlined.html",
        ":styles.css",
        "//tensorbored/components:polymer3_lib_binary.js",
    ],
    path = "/",
    deps = [
        ":tb_webapp",
        "//tensorbored/components/tf_imports:ibm_plex_mono",
        "//tensorbored/components/tf_imports:inter",
        "//tensorbored/components/tf_imports:roboto",
        "//tensorbored/webapp/widgets/source_code/monaco:requirejs",
    ],
)

# A Vulcanized html binary for the complete app (both Angular and Polymer parts)
tb_combine_html(
    name = "index_suffixless",
    input_path = "/index_polymer3.inlined.html",
    # Do note that JavaScript filename is created off of `name` of this target yet the
    # script tag is created based on the `js_path`. Here, we put the handlebar that is to
    # be replaced by `:index`.
    js_path = "/%INDEX.js%",
    output_path = "/index_suffixless.html",
    deps = [":tensorboard-webapp"],
)

genrule(
    name = "index_js",
    srcs = ["index_suffixless.js"],
    outs = ["index.js"],
    cmd = "cat $(SRCS) >$@",
)

tf_resource_digest_suffixer(
    name = "index",
    out = "index.html",
    resources = {
        "%INDEX.js%": ":index.js",
    },
    template = ":index_suffixless.html",
)

# Karma has overhead of bootstrap/tearDown. Combine as much testcases
# as possible into one test target and use test sharding to speed up.
tf_ng_web_test_suite(
    name = "karma_test",
    deps = [
        "//tensorbored/webapp/alert:test_lib",
        "//tensorbored/webapp/alert/store:test_lib",
        "//tensorbored/webapp/alert/views:views_test",
        "//tensorbored/webapp/app_routing:app_routing_test",
        "//tensorbored/webapp/app_routing:route_config_test",
        "//tensorbored/webapp/app_routing:testing",
        "//tensorbored/webapp/app_routing/effects:effects_tests",
        "//tensorbored/webapp/app_routing/store:store_test_lib",
        "//tensorbored/webapp/app_routing/store:testing",
        "//tensorbored/webapp/app_routing/views:views_tests",
        "//tensorbored/webapp/core/effects:core_effects_test_lib",
        "//tensorbored/webapp/core/store:core_store_test_lib",
        "//tensorbored/webapp/core/views:test_lib",
        "//tensorbored/webapp/customization:customization_test_lib",
        "//tensorbored/webapp/deeplink:deeplink_test_lib",
        "//tensorbored/webapp/experiments/store:store_test_lib",
        "//tensorbored/webapp/header:test_lib",
        "//tensorbored/webapp/metrics:integration_test",
        "//tensorbored/webapp/metrics:test_lib",
        "//tensorbored/webapp/metrics:utils_test",
        "//tensorbored/webapp/metrics/data_source:metrics_data_source_test",
        "//tensorbored/webapp/metrics/data_source:saved_pins_data_source_test",
        "//tensorbored/webapp/metrics/effects:effects_test",
        "//tensorbored/webapp/metrics/store:store_test",
        "//tensorbored/webapp/metrics/views:views_test",
        "//tensorbored/webapp/metrics/views/card_renderer:card_renderer_tests",
        "//tensorbored/webapp/metrics/views/main_view:main_view_tests",
        "//tensorbored/webapp/metrics/views/right_pane:right_pane_test",
        "//tensorbored/webapp/metrics/views/right_pane/saving_pins_dialog:saving_pins_dialog_test",
        "//tensorbored/webapp/metrics/views/right_pane/scalar_column_editor:scalar_column_editor_test",
        "//tensorbored/webapp/plugins:plugins_container_test_lib",
        "//tensorbored/webapp/reloader:test_lib",
        "//tensorbored/webapp/routes:routes_test_lib",
        "//tensorbored/webapp/runs/data_source:runs_data_source_test",
        "//tensorbored/webapp/runs/effects:effects_test",
        "//tensorbored/webapp/runs/store:store_test",
        "//tensorbored/webapp/runs/store:testing",
        "//tensorbored/webapp/runs/views/runs_selector:runs_selector_test",
        "//tensorbored/webapp/runs/views/runs_table:runs_table_test",
        "//tensorbored/webapp/util:util_tests",
        "//tensorbored/webapp/webapp_data_source:http_client_test",
        "//tensorbored/webapp/webapp_data_source:webapp_data_source_test_lib",
        "//tensorbored/webapp/widgets:resize_detector_test",
        "//tensorbored/webapp/widgets:resize_detector_testing",
        "//tensorbored/webapp/widgets/card_fob:card_fob_test",
        "//tensorbored/webapp/widgets/content_wrapping_input:content_wrapping_input_tests",
        "//tensorbored/webapp/widgets/custom_modal:custom_modal_test",
        "//tensorbored/webapp/widgets/data_table:data_table_test",
        "//tensorbored/webapp/widgets/data_table:utils_test",
        "//tensorbored/webapp/widgets/dropdown:dropdown_tests",
        "//tensorbored/webapp/widgets/experiment_alias:experiment_alias_test",
        "//tensorbored/webapp/widgets/filter_input:filter_input_test",
        "//tensorbored/webapp/widgets/histogram:histogram_test",
        "//tensorbored/webapp/widgets/intersection_observer:intersection_observer_test",
        "//tensorbored/webapp/widgets/intersection_observer:intersection_observer_testing",
        "//tensorbored/webapp/widgets/line_chart_v2:line_chart_v2_tests",
        "//tensorbored/webapp/widgets/line_chart_v2/lib:lib_tests",
        "//tensorbored/webapp/widgets/line_chart_v2/lib/renderer:renderer_test",
        "//tensorbored/webapp/widgets/line_chart_v2/lib/worker:worker_test",
        "//tensorbored/webapp/widgets/line_chart_v2/sub_view:sub_view_tests",
        "//tensorbored/webapp/widgets/markdown_renderer:markdown_renderer_tests",
        "//tensorbored/webapp/widgets/range_input:range_input_tests",
        "//tensorbored/webapp/widgets/source_code:source_code_container_test_lib",
        "//tensorbored/webapp/widgets/source_code:source_code_test_lib",
        "//tensorbored/webapp/widgets/text:text_tests",
    ],
)

tf_svg_bundle(
    name = "svg_bundle",
    # When modifying below, please make sure to update
    # //tensorbored/webapp/testing/mat_icon_module.ts.
    # 'com_google_material_design_icon' in third_party/js.bzl
    srcs = [
        "@com_google_material_design_icon//:add_24px.svg",
        "@com_google_material_design_icon//:arrow_back_24px.svg",
        "@com_google_material_design_icon//:arrow_downward_24px.svg",
        "@com_google_material_design_icon//:arrow_forward_24px.svg",
        "@com_google_material_design_icon//:arrow_upward_24px.svg",
        "@com_google_material_design_icon//:brightness_6_24px.svg",
        "@com_google_material_design_icon//:bug_report_24px.svg",
        "@com_google_material_design_icon//:cancel_24px.svg",
        "@com_google_material_design_icon//:change_history_24px.svg",
        "@com_google_material_design_icon//:chevron_left_24px.svg",
        "@com_google_material_design_icon//:chevron_right_24px.svg",
        "@com_google_material_design_icon//:clear_24px.svg",
        "@com_google_material_design_icon//:close_24px.svg",
        "@com_google_material_design_icon//:content_copy_24px.svg",
        "@com_google_material_design_icon//:dark_mode_24px.svg",
        "@com_google_material_design_icon//:done_24px.svg",
        "@com_google_material_design_icon//:drag_indicator_24px.svg",
        "@com_google_material_design_icon//:edit_24px.svg",
        "@com_google_material_design_icon//:error_24px.svg",
        "@com_google_material_design_icon//:expand_less_24px.svg",
        "@com_google_material_design_icon//:expand_more_24px.svg",
        "@com_google_material_design_icon//:filter_alt_24px.svg",
        "@com_google_material_design_icon//:filter_list_24px.svg",
        "@com_google_material_design_icon//:flag_24px.svg",
        "@com_google_material_design_icon//:fullscreen_24px.svg",
        "@com_google_material_design_icon//:fullscreen_exit_24px.svg",
        "@com_google_material_design_icon//:get_app_24px.svg",
        "@com_google_material_design_icon//:group_work_24px.svg",
        "@com_google_material_design_icon//:help_outline_24px.svg",
        "@com_google_material_design_icon//:image_search_24px.svg",
        "@com_google_material_design_icon//:info_outline_24px.svg",
        "@com_google_material_design_icon//:keep_24px.svg",
        "@com_google_material_design_icon//:keep_outline_24px.svg",
        "@com_google_material_design_icon//:light_mode_24px.svg",
        "@com_google_material_design_icon//:line_weight_24px.svg",
        "@com_google_material_design_icon//:more_vert_24px.svg",
        "@com_google_material_design_icon//:notifications_none_24px.svg",
        "@com_google_material_design_icon//:open_in_new_24px.svg",
        "@com_google_material_design_icon//:palette_24px.svg",
        "@com_google_material_design_icon//:person_24px.svg",
        "@com_google_material_design_icon//:refresh_24px.svg",
        "@com_google_material_design_icon//:search_24px.svg",
        "@com_google_material_design_icon//:settings_24px.svg",
        "@com_google_material_design_icon//:settings_backup_restore_24px.svg",
        "@com_google_material_design_icon//:settings_overscan_24px.svg",
        "@com_google_material_design_icon//:visibility_off_24px.svg",
        "@com_google_material_design_icon//:warning_24px.svg",
    ],
    out = "icon_bundle.svg",
)

tf_external_sass_libray(
    name = "angular_material_sass_deps",
    deps = ["@npm//@angular/material"],
)

tf_sass_binary(
    name = "styles",
    src = "styles.scss",
    deps = ["//tensorbored/webapp/theme"],
)

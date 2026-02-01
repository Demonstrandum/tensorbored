load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_ng_web_test_suite")

package(default_visibility = ["//tensorbored:internal"])

tf_ng_module(
    name = "persistent_settings",
    srcs = [
        "index.ts",
        "persistent_settings_module.ts",
    ],
    deps = [
        ":config_module",
        "//tensorbored/webapp/persistent_settings/_data_source",
        "//tensorbored/webapp/persistent_settings/_data_source:types",
        "//tensorbored/webapp/persistent_settings/_redux",
        "//tensorbored/webapp/persistent_settings/_redux:persistent_settings_actions",
        "//tensorbored/webapp/persistent_settings/_redux:types",
        "@npm//@angular/core",
        "@npm//@ngrx/effects",
        "@npm//@ngrx/store",
    ],
)

tf_ng_module(
    name = "config_types",
    srcs = [
        "persistent_settings_config_types.ts",
    ],
    deps = [
        "//tensorbored/webapp/persistent_settings/_data_source:types",
        "@npm//@angular/core",
        "@npm//@ngrx/store",
    ],
)

tf_ng_module(
    name = "config_module",
    srcs = [
        "persistent_settings_config_module.ts",
    ],
    deps = [
        ":config_types",
        "//tensorbored/webapp/persistent_settings/_data_source:types",
        "@npm//@angular/core",
        "@npm//@ngrx/store",
    ],
)

tf_ng_module(
    name = "config_module_test_lib",
    testonly = True,
    srcs = [
        "persistent_settings_config_module_test.ts",
    ],
    deps = [
        ":config_module",
        "//tensorbored/webapp/angular:expect_angular_core_testing",
        "//tensorbored/webapp/persistent_settings/_data_source:types",
        "@npm//@ngrx/store",
        "@npm//@types/jasmine",
        "@npm//rxjs",
    ],
)

tf_ng_web_test_suite(
    name = "karma_test",
    deps = [
        ":config_module_test_lib",
        "//tensorbored/webapp/persistent_settings/_data_source:_data_source_test_lib",
        "//tensorbored/webapp/persistent_settings/_redux:_redux_test_lib",
    ],
)

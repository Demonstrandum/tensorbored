load("//tensorbored/defs:defs.bzl", "tf_ng_module", "tf_ts_library")

package(default_visibility = ["//tensorbored:internal"])

tf_ng_module(
    name = "store",
    srcs = [
        "core_initial_state_provider.ts",
        "core_reducers.ts",
        "core_selectors.ts",
        "core_types.ts",
        "index.ts",
    ],
    deps = [
        "//tensorbored/webapp/app_routing:namespaced_state_reducer_helper",
        "//tensorbored/webapp/app_routing/actions",
        "//tensorbored/webapp/core:types",
        "//tensorbored/webapp/core/actions",
        "//tensorbored/webapp/deeplink",
        "//tensorbored/webapp/persistent_settings",
        "//tensorbored/webapp/types",
        "//tensorbored/webapp/util:ngrx",
        "@npm//@angular/core",
        "@npm//@ngrx/store",
        "@npm//rxjs",
    ],
)

tf_ts_library(
    name = "core_store_test_lib",
    testonly = True,
    srcs = [
        "core_initial_state_provider_test.ts",
        "core_reducers_test.ts",
        "core_selectors_test.ts",
    ],
    deps = [
        ":store",
        "//tensorbored/webapp/app_routing:types",
        "//tensorbored/webapp/app_routing/actions",
        "//tensorbored/webapp/core:types",
        "//tensorbored/webapp/core/actions",
        "//tensorbored/webapp/core/testing",
        "//tensorbored/webapp/deeplink",
        "//tensorbored/webapp/persistent_settings",
        "//tensorbored/webapp/types",
        "@npm//@types/jasmine",
    ],
)

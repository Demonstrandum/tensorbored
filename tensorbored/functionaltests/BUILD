load("@io_bazel_rules_webtesting//web:py.bzl", "py_web_test_suite")

package(default_visibility = ["//tensorbored:internal"])

licenses(["notice"])

py_web_test_suite(
    name = "core_test",
    srcs = ["core_test.py"],
    browsers = ["//tensorbored/functionaltests/browsers:chromium"],
    data = [
        "//tensorbored",
    ],
    # TODO(@jart): Make this fast and not flaky.
    flaky = True,
    srcs_version = "PY3",
    tags = [
        "manual",
        "webtest",
    ],
    deps = [
        "//tensorbored/plugins/audio:audio_demo",
        "//tensorbored/plugins/scalar:scalars_demo",
        "@io_bazel_rules_webtesting//testing/web",
    ],
)

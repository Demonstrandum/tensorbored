load("@rules_web_testing_python//web:py.bzl", "py_web_test_suite")

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
    tags = [
        "manual",
        "webtest",
    ],
    deps = [
        "//tensorbored/plugins/audio:audio_demo",
        "//tensorbored/plugins/scalar:scalars_demo",
        "@rules_web_testing_python//testing/web",
    ],
)

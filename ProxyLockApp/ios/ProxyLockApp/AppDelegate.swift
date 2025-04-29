import UIKit
import React

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
    let jsBundleURL: URL = {
      if let mainBundleURL = Bundle.main.url(forResource: "main", withExtension: "jsbundle") {
        return mainBundleURL
      }
      return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")!
    }()
    
    let rootView = RCTRootView(
      bundleURL: jsBundleURL,
      moduleName: "ProxyLockApp",
      initialProperties: nil,
      launchOptions: launchOptions
    )

    let rootViewController = UIViewController()
    rootViewController.view = rootView

    window = UIWindow(frame: UIScreen.main.bounds)
    window?.rootViewController = rootViewController
    window?.makeKeyAndVisible()

    return true
  }
}

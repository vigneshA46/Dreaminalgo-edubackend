import { refreshTokenService } from "./auth.refresh.service.js";

export const refreshToken = async (req, res) => {
  const oldRefreshToken = req.cookies.refreshToken;

  const { accessToken, refreshToken } =
    await refreshTokenService(oldRefreshToken);
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/"
  });

  res.cookie("accessToken",accessToken,{
     httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/"
  })

  console.log("🍪 Cookies:", req.cookies);

  res.status(200).json({ accessToken });
};

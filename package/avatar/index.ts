import { withInstall } from "../../src/utils/with-install";
import "./index.scss";
import _Avatar from "./avatar";

export const Avatar = withInstall(_Avatar);
export type { AvatarSize, AvatarShape, AvatarFit } from "./avatar";
export default Avatar;

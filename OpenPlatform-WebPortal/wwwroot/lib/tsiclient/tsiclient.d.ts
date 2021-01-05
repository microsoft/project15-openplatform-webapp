import ServerClient from "./ServerClient";
import UXClient from "./UXClient-54201377";
import Utils from "./Utils-6bcf72cd";
declare class TsiClient {
    server: ServerClient;
    ux: UXClient;
    utils: typeof Utils;
}
export { TsiClient as default };

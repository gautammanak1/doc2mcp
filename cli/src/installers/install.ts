import type { CliClient } from "./detect.js";
import {
  mergeMcpServers,
  mergeVscodeMcp,
  readJsonFile,
  writeJsonFile,
} from "./merge.js";

export type InstallPayload = {
  cursor: Record<string, unknown>;
  vscode: Record<string, unknown>;
  windsurf: Record<string, unknown>;
  claude: Record<string, unknown>;
  serverName: string;
};

export async function installToClient(
  client: CliClient,
  configPath: string,
  payload: InstallPayload
): Promise<void> {
  if (client === "cursor") {
    const existing = await readJsonFile(configPath);
    const merged = mergeMcpServers(existing, payload.cursor);
    await writeJsonFile(configPath, merged);
    return;
  }

  if (client === "vscode") {
    const existing = await readJsonFile(configPath);
    const merged = mergeVscodeMcp(existing, payload.vscode);
    await writeJsonFile(configPath, merged);
    return;
  }

  if (client === "windsurf") {
    const existing = await readJsonFile(configPath);
    const merged = mergeMcpServers(existing, payload.windsurf);
    await writeJsonFile(configPath, merged);
    return;
  }

  if (client === "claude") {
    const existing = await readJsonFile(configPath);
    const merged = mergeMcpServers(existing, payload.claude);
    await writeJsonFile(configPath, merged);
  }
}

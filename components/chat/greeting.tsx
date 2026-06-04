import { motion } from "framer-motion";

export const Greeting = () => {
  return (
    <div className="flex flex-col items-center px-4 max-w-xl mx-auto py-12" key="overview">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="text-center font-display font-semibold text-4xl sm:text-5xl bg-gradient-to-r from-[#4285f4] via-[#9b72cb] to-[#d96570] bg-clip-text text-transparent tracking-tight"
        initial={{ opacity: 0, y: 12 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        Hello, Developer.
      </motion.div>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 text-center text-muted-foreground/75 text-sm sm:text-base leading-relaxed"
        initial={{ opacity: 0, y: 12 }}
        transition={{ delay: 0.35, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        How can I help you build or query your AI context today?
        <br />
        <span className="text-xs text-muted-foreground/50 mt-1 block">
          Toggle doc2mcp below to instantly transform any docs URL into a queryable MCP server.
        </span>
      </motion.div>
    </div>
  );
};

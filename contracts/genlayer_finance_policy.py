# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *


class GenLayerFinancePolicy(gl.Contract):
    project_name: str
    latest_report_hash: str
    latest_signal_json: str
    latest_policy_json: str
    report_count: u256
    signal_count: u256
    policy_check_count: u256

    def __init__(self, project_name: str):
        self.project_name = project_name
        self.latest_report_hash = ""
        self.latest_signal_json = "{}"
        self.latest_policy_json = "{}"
        self.report_count = 0
        self.signal_count = 0
        self.policy_check_count = 0

    @gl.public.write
    def register_report(self, report_hash: str, source_url: str, summary: str) -> str:
        self.latest_report_hash = report_hash
        self.report_count += 1
        return "report_hash=" + report_hash + ";source_url=" + source_url + ";summary=" + summary

    @gl.public.write
    def attest_signal(self, symbol: str, side: str, confidence: int, evidence_url: str) -> str:
        self.latest_signal_json = "symbol=" + symbol + ";side=" + side + ";confidence=" + str(confidence) + ";evidence_url=" + evidence_url
        self.signal_count += 1
        return self.latest_signal_json

    @gl.public.write
    def check_trade_intent(
        self,
        symbol: str,
        side: str,
        notional_usd: int,
        leverage: int,
        max_notional_usd: int,
        max_leverage: int,
        evidence: str,
    ) -> str:
        def judge_intent():
            task = """
You are validating a finance policy intent for a GenLayer demo.

Rules:
- approve only when notional_usd <= max_notional_usd
- approve only when leverage <= max_leverage
- reject if the evidence text is empty or unrelated
- return compact JSON only

Intent:
symbol=""" + symbol + """
side=""" + side + """
notional_usd=""" + str(notional_usd) + """
leverage=""" + str(leverage) + """
max_notional_usd=""" + str(max_notional_usd) + """
max_leverage=""" + str(max_leverage) + """
evidence=""" + evidence + """

Return exactly one line using this format:
approved=yes|no;risk_level=low|medium|high;reason=short reason
"""
            return gl.exec_prompt(task).strip()

        decision = gl.eq_principle_strict_eq(judge_intent)
        self.latest_policy_json = decision
        self.policy_check_count += 1
        return decision

    @gl.public.view
    def project(self) -> str:
        return self.project_name

    @gl.public.view
    def counters(self) -> str:
        return "reports=" + str(self.report_count) + ";signals=" + str(self.signal_count) + ";policy_checks=" + str(self.policy_check_count)

    @gl.public.view
    def latest_state(self) -> str:
        return "latest_report_hash=" + self.latest_report_hash + ";latest_signal=" + self.latest_signal_json + ";latest_policy=" + self.latest_policy_json

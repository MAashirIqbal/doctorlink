import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import '../../core/api_service.dart';
import '../../core/theme.dart';
import '../../widgets/toast.dart';

class ServerSettingsScreen extends StatefulWidget {
  /// When true, this is shown on first launch — we navigate to /login on save.
  /// When false, it was opened from the login screen — we just pop back.
  final bool firstRun;
  const ServerSettingsScreen({super.key, this.firstRun = false});

  @override
  State<ServerSettingsScreen> createState() => _ServerSettingsScreenState();
}

class _ServerSettingsScreenState extends State<ServerSettingsScreen> {
  final _urlController = TextEditingController();
  bool _testing = false;
  bool _saving = false;
  bool? _lastTestPassed;

  @override
  void initState() {
    super.initState();
    _urlController.text = ApiService.baseUrl;
  }

  @override
  void dispose() {
    _urlController.dispose();
    super.dispose();
  }

  Future<void> _testConnection() async {
    setState(() {
      _testing = true;
      _lastTestPassed = null;
    });
    final ok = await ApiService.healthCheck(_urlController.text);
    if (!mounted) return;
    setState(() {
      _testing = false;
      _lastTestPassed = ok;
    });
    AppToast.show(
      context,
      ok ? 'Backend reachable!' : 'Could not reach the server.',
      type: ok ? ToastType.success : ToastType.error,
    );
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    await ApiService.setBaseUrl(_urlController.text);
    if (!mounted) return;
    AppToast.show(context, 'Server URL saved', type: ToastType.success);
    setState(() => _saving = false);
    if (widget.firstRun) {
      Navigator.pushNamedAndRemoveUntil(context, '/login', (_) => false);
    } else {
      Navigator.pop(context);
    }
  }

  void _applyPreset(String preset) {
    setState(() {
      _urlController.text = preset;
      _lastTestPassed = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppColors.heroGradient),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (!widget.firstRun)
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Iconsax.arrow_left, color: Colors.white),
                  ),
                const SizedBox(height: 6),
                Container(
                  width: 70, height: 70,
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981).withValues(alpha: 0.18),
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
                  ),
                  child: const Icon(Iconsax.cloud_change, size: 30, color: Color(0xFF4ADE80)),
                ),
                const SizedBox(height: 24),
                Text(
                  widget.firstRun ? 'Connect to your server' : 'Server settings',
                  style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: -0.6),
                ),
                const SizedBox(height: 8),
                Text(
                  widget.firstRun
                      ? 'Pick where the DoctorLink backend lives. You can change this any time.'
                      : 'Update where the app talks to the API.',
                  style: TextStyle(fontSize: 13, color: Colors.white.withValues(alpha: 0.6), fontWeight: FontWeight.w600, height: 1.5),
                ),
                const SizedBox(height: 28),

                // URL field
                Text('API BASE URL',
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white.withValues(alpha: 0.45), letterSpacing: 2.2)),
                const SizedBox(height: 8),
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.05),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: _lastTestPassed == true
                          ? const Color(0xFF4ADE80).withValues(alpha: 0.6)
                          : _lastTestPassed == false
                              ? Colors.redAccent.withValues(alpha: 0.6)
                              : Colors.white.withValues(alpha: 0.08),
                    ),
                  ),
                  child: TextField(
                    controller: _urlController,
                    keyboardType: TextInputType.url,
                    autocorrect: false,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontFamily: 'monospace'),
                    cursorColor: const Color(0xFF4ADE80),
                    decoration: InputDecoration(
                      hintText: 'https://your-backend.example.com/api',
                      hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.2), fontWeight: FontWeight.w600),
                      prefixIcon: const Icon(Iconsax.global, color: Color(0xFF10B981), size: 20),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
                    ),
                  ),
                ),

                const SizedBox(height: 14),

                // Quick presets
                Text('PRESETS',
                    style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.white.withValues(alpha: 0.4), letterSpacing: 2.2)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _presetChip('Vercel (production)', ApiService.defaultBaseUrl),
                    _presetChip('Android emulator', 'http://10.0.2.2:5000/api'),
                    _presetChip('iOS simulator', 'http://localhost:5000/api'),
                  ],
                ),

                const SizedBox(height: 22),

                // Test + Save buttons
                Row(
                  children: [
                    Expanded(
                      child: SizedBox(
                        height: 52,
                        child: OutlinedButton.icon(
                          onPressed: _testing ? null : _testConnection,
                          icon: _testing
                              ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2.4, valueColor: AlwaysStoppedAnimation(Color(0xFF4ADE80))))
                              : const Icon(Iconsax.flash, size: 16, color: Color(0xFF4ADE80)),
                          label: Text(_testing ? 'Testing...' : 'Test connection',
                              style: const TextStyle(color: Color(0xFF4ADE80), fontWeight: FontWeight.w900, fontSize: 13)),
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(color: const Color(0xFF4ADE80).withValues(alpha: 0.4)),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: SizedBox(
                        height: 52,
                        child: ElevatedButton.icon(
                          onPressed: _saving ? null : _save,
                          icon: _saving
                              ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2.4, valueColor: AlwaysStoppedAnimation(Colors.white)))
                              : const Icon(Iconsax.save_2, size: 16),
                          label: Text(_saving ? 'Saving...' : (widget.firstRun ? 'Save & continue' : 'Save'),
                              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF16A34A),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                            elevation: 0,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 22),

                // Help block
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.04),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.06)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(children: [
                        const Icon(Iconsax.info_circle, color: Color(0xFF4ADE80), size: 16),
                        const SizedBox(width: 8),
                        Text('Tips',
                            style: TextStyle(color: Colors.white.withValues(alpha: 0.85), fontWeight: FontWeight.w900, fontSize: 12, letterSpacing: 0.5)),
                      ]),
                      const SizedBox(height: 8),
                      _tip('• Must end with /api (we add it for you)'),
                      _tip('• Android emulator → host machine: 10.0.2.2'),
                      _tip('• Real phone over Wi-Fi: use your PC\'s LAN IP, e.g. http://192.168.1.42:5000/api'),
                      _tip('• HTTP (non-HTTPS) requires usesCleartextTraffic on Android'),
                    ],
                  ),
                ),

                if (widget.firstRun) ...[
                  const SizedBox(height: 12),
                  Center(
                    child: TextButton(
                      onPressed: () async {
                        await ApiService.setBaseUrl(ApiService.defaultBaseUrl);
                        if (!mounted) return;
                        Navigator.pushNamedAndRemoveUntil(context, '/login', (_) => false);
                      },
                      child: Text('Skip (use Vercel default)',
                          style: TextStyle(color: Colors.white.withValues(alpha: 0.45), fontWeight: FontWeight.w800, fontSize: 12)),
                    ),
                  ),
                ],
                const SizedBox(height: 30),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _presetChip(String label, String url) {
    final selected = _urlController.text.trim() == url;
    return GestureDetector(
      onTap: () => _applyPreset(url),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: selected
              ? const Color(0xFF4ADE80).withValues(alpha: 0.15)
              : Colors.white.withValues(alpha: 0.05),
          borderRadius: BorderRadius.circular(99),
          border: Border.all(
            color: selected
                ? const Color(0xFF4ADE80).withValues(alpha: 0.5)
                : Colors.white.withValues(alpha: 0.1),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: selected ? const Color(0xFF4ADE80) : Colors.white.withValues(alpha: 0.7),
            fontWeight: FontWeight.w800,
            fontSize: 11,
          ),
        ),
      ),
    );
  }

  Widget _tip(String text) => Padding(
        padding: const EdgeInsets.only(bottom: 4),
        child: Text(text,
            style: TextStyle(color: Colors.white.withValues(alpha: 0.55), fontWeight: FontWeight.w600, fontSize: 11.5, height: 1.5)),
      );
}

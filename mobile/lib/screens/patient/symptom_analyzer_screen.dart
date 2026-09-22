import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:iconsax/iconsax.dart';
import 'package:image_picker/image_picker.dart';
import '../../core/api_service.dart';
import '../../core/theme.dart';
import '../../widgets/toast.dart';
import '../../widgets/avatar_widget.dart';

class SymptomAnalyzerScreen extends StatefulWidget {
  const SymptomAnalyzerScreen({super.key});

  @override
  State<SymptomAnalyzerScreen> createState() => _SymptomAnalyzerScreenState();
}

class _SymptomAnalyzerScreenState extends State<SymptomAnalyzerScreen> {
  final _symptomsController = TextEditingController();
  final _ageController = TextEditingController();
  String? _gender;
  File? _image;
  bool _loading = false;
  Map<String, dynamic>? _result;
  String? _refusalMessage;

  @override
  void dispose() {
    _symptomsController.dispose();
    _ageController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    try {
      final picker = ImagePicker();
      final picked = await picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 85,
        maxWidth: 1600,
      );
      if (picked != null) {
        final f = File(picked.path);
        final bytes = await f.length();
        if (bytes > 4 * 1024 * 1024) {
          if (mounted) AppToast.show(context, 'Image must be smaller than 4 MB', type: ToastType.warning);
          return;
        }
        setState(() => _image = f);
      }
    } catch (e) {
      if (mounted) AppToast.show(context, 'Could not pick image', type: ToastType.error);
    }
  }

  Future<void> _analyze() async {
    final symptoms = _symptomsController.text.trim();
    if (symptoms.length < 5) {
      AppToast.show(context, 'Please describe your symptoms (at least 5 chars)', type: ToastType.warning);
      return;
    }
    setState(() {
      _loading = true;
      _result = null;
      _refusalMessage = null;
    });
    try {
      final res = await ApiService.analyzeSymptoms(
        symptoms: symptoms,
        age: _ageController.text.trim().isEmpty ? null : _ageController.text.trim(),
        gender: _gender,
        imagePath: _image?.path,
      );
      if (!mounted) return;
      setState(() => _result = Map<String, dynamic>.from(res.data));
    } catch (e) {
      // Backend returns 400 with valid:false for off-topic
      String msg = 'Analysis failed. Please try again.';
      bool refusal = false;
      try {
        // Dio error
        final response = (e as dynamic).response;
        if (response?.data is Map) {
          if (response.data['valid'] == false) {
            refusal = true;
            msg = response.data['message'] ?? msg;
          } else if (response.data['message'] != null) {
            msg = response.data['message'];
          }
        }
      } catch (_) {/* ignore */}
      if (!mounted) return;
      if (refusal) {
        setState(() => _refusalMessage = msg);
      } else {
        AppToast.show(context, msg, type: ToastType.error);
      }
    }
    if (mounted) setState(() => _loading = false);
  }

  Color _severityColor(String s) {
    switch (s) {
      case 'emergency':
        return AppColors.error;
      case 'severe':
        return Colors.deepOrange;
      case 'moderate':
        return AppColors.warning;
      default:
        return AppColors.success;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Symptom Analyzer'),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(99),
                border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Iconsax.magic_star, size: 10, color: AppColors.primaryDark),
                  SizedBox(width: 3),
                  Text('AI', style: TextStyle(color: AppColors.primaryDark, fontWeight: FontWeight.w900, fontSize: 10)),
                ],
              ),
            ),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Disclaimer
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.warning.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.warning.withValues(alpha: 0.3)),
              ),
              child: const Row(
                children: [
                  Icon(Iconsax.shield_cross, color: AppColors.warning, size: 18),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Triage guidance only — not a medical diagnosis. For emergencies call 1122.',
                      style: TextStyle(color: AppColors.warning, fontWeight: FontWeight.w700, fontSize: 12, height: 1.4),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Form
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.border.withValues(alpha: 0.5)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Describe your symptoms',
                      style: TextStyle(fontWeight: FontWeight.w900, color: AppColors.textPrimary, fontSize: 13)),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _symptomsController,
                    minLines: 4,
                    maxLines: 8,
                    maxLength: 1500,
                    textCapitalization: TextCapitalization.sentences,
                    decoration: const InputDecoration(
                      hintText: 'e.g. I\'ve had a sore throat, fever, body aches for 3 days. Cough is dry and worse at night.',
                      counterText: '',
                    ),
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _ageController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(hintText: 'Age', prefixIcon: Icon(Iconsax.user)),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          isExpanded: true,
                          initialValue: _gender,
                          decoration: const InputDecoration(hintText: 'Gender'),
                          items: const [
                            DropdownMenuItem(value: 'male', child: Text('Male')),
                            DropdownMenuItem(value: 'female', child: Text('Female')),
                            DropdownMenuItem(value: 'other', child: Text('Other')),
                          ],
                          onChanged: (v) => setState(() => _gender = v),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  // Image picker
                  GestureDetector(
                    onTap: _pickImage,
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppColors.border.withValues(alpha: 0.5), style: BorderStyle.solid),
                      ),
                      child: _image == null
                          ? const Row(children: [
                              Icon(Iconsax.gallery_add, color: AppColors.textMuted, size: 20),
                              SizedBox(width: 10),
                              Expanded(
                                child: Text('Optional: attach a photo (rash, swelling, wound)',
                                    style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.w600, fontSize: 13)),
                              ),
                            ])
                          : Row(children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(10),
                                child: Image.file(_image!, width: 44, height: 44, fit: BoxFit.cover),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  _image!.path.split(RegExp(r'[\\/]')).last,
                                  style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w700, fontSize: 12),
                                  maxLines: 1, overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              GestureDetector(
                                onTap: () => setState(() => _image = null),
                                child: const Padding(
                                  padding: EdgeInsets.all(6),
                                  child: Icon(Iconsax.close_circle, color: AppColors.error, size: 18),
                                ),
                              ),
                            ]),
                    ),
                  ),
                  const SizedBox(height: 18),
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton.icon(
                      onPressed: _loading ? null : _analyze,
                      icon: _loading
                          ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2.5, valueColor: AlwaysStoppedAnimation(Colors.white)))
                          : const Icon(Iconsax.magic_star, size: 18),
                      label: Text(_loading ? 'Analyzing...' : 'Analyze Symptoms', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        elevation: 0,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Refusal
            if (_refusalMessage != null) ...[
              const SizedBox(height: 18),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.error.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.error.withValues(alpha: 0.3)),
                ),
                child: Row(
                  children: [
                    const Icon(Iconsax.warning_2, color: AppColors.error, size: 18),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(_refusalMessage!,
                          style: const TextStyle(color: AppColors.error, fontWeight: FontWeight.w700, fontSize: 12, height: 1.4)),
                    ),
                  ],
                ),
              ),
            ],

            // Result
            if (_result != null && _result!['valid'] == true) ...[
              const SizedBox(height: 18),
              _buildResult(),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildResult() {
    final severity = (_result!['severity'] as String?) ?? 'mild';
    final summary = (_result!['summary'] as String?) ?? '';
    final specs = (_result!['specializations'] as List? ?? []).cast<Map<String, dynamic>>();
    final redFlags = (_result!['redFlags'] as List? ?? []).cast<String>();
    final selfCare = (_result!['selfCare'] as List? ?? []).cast<String>();
    final docs = (_result!['recommendedDoctors'] as List? ?? []).cast<Map<String, dynamic>>();
    final disclaimer = (_result!['disclaimer'] as String?) ?? '';
    final color = _severityColor(severity);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: color.withValues(alpha: 0.3)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text('SEVERITY: ${severity.toUpperCase()}',
                      style: TextStyle(color: color, fontWeight: FontWeight.w900, fontSize: 11, letterSpacing: 1.2)),
                ],
              ),
              const SizedBox(height: 8),
              Text(summary,
                  style: TextStyle(color: color, fontWeight: FontWeight.w800, fontSize: 14, height: 1.4)),
            ],
          ),
        ),
        if (severity == 'emergency') ...[
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.error,
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Row(
              children: [
                Icon(Iconsax.warning_2, color: Colors.white, size: 20),
                SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('This may be an emergency.',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 14)),
                      SizedBox(height: 4),
                      Text('Call 1122 or go to the nearest ER immediately.',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 12)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
        if (specs.isNotEmpty) ...[
          const SizedBox(height: 18),
          const Text('Suggested specialists', style: TextStyle(fontWeight: FontWeight.w900, color: AppColors.textPrimary, fontSize: 13)),
          const SizedBox(height: 8),
          ...specs.map((s) => Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.border.withValues(alpha: 0.5)),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 36, height: 36,
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Iconsax.health, color: AppColors.primaryDark, size: 18),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  (s['name'] as String?) ?? '',
                                  style: const TextStyle(fontWeight: FontWeight.w900, color: AppColors.textPrimary, fontSize: 13),
                                ),
                              ),
                              Text('${(((s['confidence'] ?? 0) as num) * 100).round()}% match',
                                  style: const TextStyle(color: AppColors.primaryDark, fontWeight: FontWeight.w900, fontSize: 11)),
                            ],
                          ),
                          if ((s['reason'] as String?)?.isNotEmpty ?? false) ...[
                            const SizedBox(height: 3),
                            Text(s['reason'],
                                style: const TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.w600, fontSize: 12, height: 1.35)),
                          ],
                        ],
                      ),
                    ),
                  ],
                ),
              )),
        ],
        if (redFlags.isNotEmpty) ...[
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.deepOrange.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.deepOrange.withValues(alpha: 0.3)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('RED FLAGS', style: TextStyle(color: Colors.deepOrange, fontWeight: FontWeight.w900, fontSize: 11, letterSpacing: 1.2)),
                const SizedBox(height: 8),
                ...redFlags.map((f) => Padding(
                      padding: const EdgeInsets.only(bottom: 4),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Padding(padding: EdgeInsets.only(top: 5, right: 8), child: Icon(Icons.circle, size: 5, color: Colors.deepOrange)),
                          Expanded(child: Text(f, style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w700, fontSize: 12, height: 1.4))),
                        ],
                      ),
                    )),
              ],
            ),
          ),
        ],
        if (selfCare.isNotEmpty) ...[
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border.withValues(alpha: 0.5)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('SAFE SELF-CARE', style: TextStyle(color: AppColors.primaryDark, fontWeight: FontWeight.w900, fontSize: 11, letterSpacing: 1.2)),
                const SizedBox(height: 8),
                ...selfCare.map((tip) => Padding(
                      padding: const EdgeInsets.only(bottom: 4),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Padding(padding: EdgeInsets.only(top: 4, right: 8), child: Icon(Iconsax.tick_circle, size: 13, color: AppColors.primary)),
                          Expanded(child: Text(tip, style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w700, fontSize: 12, height: 1.4))),
                        ],
                      ),
                    )),
              ],
            ),
          ),
        ],
        if (docs.isNotEmpty) ...[
          const SizedBox(height: 14),
          const Text('Available on DoctorLink', style: TextStyle(fontWeight: FontWeight.w900, color: AppColors.textPrimary, fontSize: 13)),
          const SizedBox(height: 8),
          ...docs.map((d) => GestureDetector(
                onTap: () => Navigator.pushNamed(context, '/doctor-profile', arguments: d['_id']?.toString()),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.border.withValues(alpha: 0.5)),
                  ),
                  child: Row(
                    children: [
                      Builder(builder: (_) {
                        final url = resolveAvatarUrl(d['avatar'] as String?);
                        return CircleAvatar(
                          radius: 22,
                          backgroundColor: AppColors.primary.withValues(alpha: 0.15),
                          backgroundImage: url.isNotEmpty ? NetworkImage(url) : null,
                          child: url.isEmpty
                              ? Text(((d['fullName'] as String?) ?? '?').characters.first,
                                  style: const TextStyle(color: AppColors.primaryDark, fontWeight: FontWeight.w900))
                              : null,
                        );
                      }),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text((d['fullName'] as String?) ?? '',
                                style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w900, fontSize: 13)),
                            Text('${d['specialization'] ?? ''} · Rs. ${d['fee'] ?? 0}',
                                style: const TextStyle(color: AppColors.primaryDark, fontWeight: FontWeight.w700, fontSize: 11)),
                          ],
                        ),
                      ),
                      const Icon(Iconsax.arrow_right_3, color: AppColors.textMuted, size: 16),
                    ],
                  ),
                ),
              )),
        ],
        if (disclaimer.isNotEmpty) ...[
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(disclaimer,
                style: const TextStyle(color: AppColors.textMuted, fontWeight: FontWeight.w600, fontSize: 11, height: 1.4)),
          ),
        ],
      ],
    ).animate().fadeIn(duration: 350.ms);
  }
}
